import fs from 'fs-extra'
import path from 'path'

interface KubernetesProjectOptions {
  image?: string
  port?: number
  replicas?: number
}

export async function generateKubernetesProject(
  projectName: string,
  options: KubernetesProjectOptions = {}
) {
  const projectPath = path.join(process.cwd(), projectName)
  const image = options.image || 'nginx:latest'
  const port = options.port || 80
  const replicas = options.replicas || 1

  try {
    // Create project directory
    await fs.mkdir(projectPath)

    // Create deployment.yaml
    await fs.writeFile(
      path.join(projectPath, 'deployment.yaml'),
      `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${projectName}
  labels:
    app: ${projectName}
spec:
  replicas: ${replicas}
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

    // Create service.yaml
    await fs.writeFile(
      path.join(projectPath, 'service.yaml'),
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

    // Create README.md
    await fs.writeFile(
      path.join(projectPath, 'README.md'),
      `# ${projectName}

Kubernetes manifests for ${projectName}.

## Components
- Deployment: \`deployment.yaml\`
- Service: \`service.yaml\`

## Deployment
To deploy to your Kubernetes cluster:

\`\`\`bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
\`\`\`

## Configuration
- Image: ${image}
- Port: ${port}
- Replicas: ${replicas}
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
