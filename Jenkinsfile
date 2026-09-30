pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '883155610395'
        ECR_REGISTRY = '883155610395.dkr.ecr.us-east-1.amazonaws.com'
        ECR_REPOSITORY = 'motgarage'
        BACKEND_IMAGE = "${ECR_REGISTRY}/${ECR_REPOSITORY}:backend-${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${ECR_REGISTRY}/${ECR_REPOSITORY}:frontend-${BUILD_NUMBER}"
        BACKEND_LATEST = "${ECR_REGISTRY}/${ECR_REPOSITORY}:backend-latest"
        FRONTEND_LATEST = "${ECR_REGISTRY}/${ECR_REPOSITORY}:frontend-latest"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/toagill/Garagebooking.git'
            }
        }

        stage('Check Docker') {
            steps {
                sh 'docker --version'
                sh 'aws --version'
            }
        }

        stage('ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION |                     docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Create ECR Repository If Missing') {
            steps {
                sh '''
                    aws ecr describe-repositories                       --repository-names $ECR_REPOSITORY                       --region $AWS_REGION >/dev/null 2>&1 ||                     aws ecr create-repository                       --repository-name $ECR_REPOSITORY                       --region $AWS_REGION
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build                       -t $BACKEND_IMAGE                       -t $BACKEND_LATEST                       backend
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build                       -t $FRONTEND_IMAGE                       -t $FRONTEND_LATEST                       frontend
                '''
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                    docker push $BACKEND_IMAGE
                    docker push $BACKEND_LATEST
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                    docker push $FRONTEND_IMAGE
                    docker push $FRONTEND_LATEST
                '''
            }
        }
    }

    post {
        success {
            echo 'Images pushed successfully to Amazon ECR.'
            echo "Backend: ${BACKEND_IMAGE}"
            echo "Frontend: ${FRONTEND_IMAGE}"
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console output.'
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
