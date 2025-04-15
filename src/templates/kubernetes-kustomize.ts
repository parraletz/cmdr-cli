import fs from 'fs-extra'
import path from 'path'

interface KubernetesKustomizeOptions {
  image?: string
  port?: number
  replicas?: number
}

export async function generateKubernetesKustomizeProject(
  projectName: string,
  options: KubernetesKustomizeOptions = {}
) {
  const projectPath = path.join(process.cwd(), projectName)
  const image = options.image || 'nginx:latest'
  const port = options.port || 80
  const replicas = options.replicas || 3

  try {
    // Create project directory and structure
    await fs.mkdir(projectPath)
    await fs.mkdir(path.join(projectPath, 'base'))
    await fs.mkdir(path.join(projectPath, 'overlays'))
    await fs.mkdir(path.join(projectPath, 'overlays/development'))
    await fs.mkdir(path.join(projectPath, 'overlays/staging'))
    await fs.mkdir(path.join(projectPath, 'overlays/production'))

    // Create base/deployment.yaml
    await fs.writeFile(
      path.join(projectPath, 'base/deployment.yaml'),
      `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${projectName}
  labels:
    app: ${projectName}
spec:
  selector:
    matchLabels:
      app: ${projectName}
  template:
    metadata:
      labels:
        app: ${projectName}
    spec:
      containers:
      - name: ${projectName}
        image: ${image}
        ports:
        - containerPort: ${port}
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "0.2"
            memory: "256Mi"
`
    )

    // Create base/service.yaml
    await fs.writeFile(
      path.join(projectPath, 'base/service.yaml'),
      `apiVersion: v1
kind: Service
metadata:
  name: ${projectName}
spec:
  selector:
    app: ${projectName}
  ports:
    - protocol: TCP
      port: ${port}
      targetPort: ${port}
  type: ClusterIP
`
    )

    // Create base/kustomization.yaml
    await fs.writeFile(
      path.join(projectPath, 'base/kustomization.yaml'),
      `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

commonLabels:
  app: ${projectName}
`
    )

    // Create development/namespace.yaml
    await fs.writeFile(
      path.join(projectPath, 'overlays/development/namespace.yaml'),
      `apiVersion: v1
kind: Namespace
metadata:
    name: ${projectName}-dev
`
    )

    // Create development overlay
    await fs.writeFile(
      path.join(projectPath, 'overlays/development/kustomization.yaml'),
      `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: ${projectName}-dev

resources:
  - ../../base

patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 1
    target:
      kind: Deployment
      name: ${projectName}

commonLabels:
  environment: development
`
    )

    // Create staging/namespace.yaml
    await fs.writeFile(
      path.join(projectPath, 'overlays/staging/namespace.yaml'),
      `apiVersion: v1
kind: Namespace
metadata:
    name: ${projectName}-staging
`
    )
    // Create staging overlay
    await fs.writeFile(
      path.join(projectPath, 'overlays/staging/kustomization.yaml'),
      `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: ${projectName}-staging

resources:
  - ../../base

patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 2
    target:
      kind: Deployment
      name: ${projectName}

commonLabels:
  environment: staging
`
    )

    // Create production/namespace.yaml
    await fs.writeFile(
      path.join(projectPath, 'overlays/development/namespace.yaml'),
      `apiVersion: v1
kind: Namespace
metadata:
    name: ${projectName}-prod
`
    )
    // Create production overlay
    await fs.writeFile(
      path.join(projectPath, 'overlays/production/kustomization.yaml'),
      `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: ${projectName}-prod

resources:
  - ../../base

patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: ${replicas}
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/cpu
        value: "1"
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: "1Gi"
      - op: replace
        path: /spec/template/spec/containers/0/resources/requests/cpu
        value: "0.5"
      - op: replace
        path: /spec/template/spec/containers/0/resources/requests/memory
        value: "512Mi"
    target:
      kind: Deployment
      name: ${projectName}

commonLabels:
  environment: production
`
    )

    // Create README.md
    await fs.writeFile(
      path.join(projectPath, 'README.md'),
      `# ${projectName}

Kubernetes manifests for ${projectName} using Kustomize.

## Structure
- \`base/\`: Base Kubernetes manifests
- \`overlays/\`: Environment-specific configurations
  - \`development/\`: Development environment (1 replica)
  - \`staging/\`: Staging environment (2 replicas)
  - \`production/\`: Production environment (${replicas} replicas)

## Deployment
To deploy to your Kubernetes cluster:

### Development
\`\`\`bash
kubectl apply -k overlays/development
\`\`\`

### Staging
\`\`\`bash
kubectl apply -k overlays/staging
\`\`\`

### Production
\`\`\`bash
kubectl apply -k overlays/production
\`\`\`

## Configuration
- Base Image: ${image}
- Container Port: ${port}
- Production Replicas: ${replicas}

### Environment Configurations
- Development: 1 replica, minimal resources
- Staging: 2 replicas, minimal resources
- Production: ${replicas} replicas, increased resources (CPU: 1 core, Memory: 1Gi)

### Preview Changes
To preview changes before applying:
\`\`\`bash
# Development
kubectl kustomize overlays/development

# Staging
kubectl kustomize overlays/staging

# Production
kubectl kustomize overlays/production
\`\`\`
`
    )
  } catch (error) {
    // Clean up if something goes wrong
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
    throw error
  }
}
