pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPOSITORY = 'motgarage'

        BACKEND_LOCAL = 'garagebooking-backend'
        FRONTEND_LOCAL = 'garagebooking-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/toagill/Garagebooking.git'
            }
        }

        stage('Check Tools') {
            steps {
                sh '''
                    docker --version
                    aws --version
                '''
            }
        }

        stage('AWS Identity') {
            steps {
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'mot'
                    ]
                ]) {
                    sh 'aws sts get-caller-identity'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build                       -t $BACKEND_LOCAL:$BUILD_NUMBER                       -t $BACKEND_LOCAL:latest                       ./backend
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build                       -t $FRONTEND_LOCAL:$BUILD_NUMBER                       -t $FRONTEND_LOCAL:latest                       ./frontend
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'mot'
                    ]
                ]) {
                    sh '''
                        ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
                        ECR_REGISTRY=$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

                        aws ecr get-login-password --region $AWS_REGION |                         docker login --username AWS --password-stdin $ECR_REGISTRY

                        echo "$ECR_REGISTRY" > .ecr_registry
                    '''
                }
            }
        }

        stage('Ensure ECR Repository') {
            steps {
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'mot'
                    ]
                ]) {
                    sh '''
                        aws ecr describe-repositories                           --repository-names $ECR_REPOSITORY                           --region $AWS_REGION >/dev/null 2>&1 ||                         aws ecr create-repository                           --repository-name $ECR_REPOSITORY                           --region $AWS_REGION >/dev/null
                    '''
                }
            }
        }

        stage('Tag Images for ECR') {
            steps {
                sh '''
                    ECR_REGISTRY=$(cat .ecr_registry)

                    docker tag                       $BACKEND_LOCAL:$BUILD_NUMBER                       $ECR_REGISTRY/$ECR_REPOSITORY:backend-$BUILD_NUMBER

                    docker tag                       $BACKEND_LOCAL:latest                       $ECR_REGISTRY/$ECR_REPOSITORY:backend-latest

                    docker tag                       $FRONTEND_LOCAL:$BUILD_NUMBER                       $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$BUILD_NUMBER

                    docker tag                       $FRONTEND_LOCAL:latest                       $ECR_REGISTRY/$ECR_REPOSITORY:frontend-latest
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'mot'
                    ]
                ]) {
                    sh '''
                        ECR_REGISTRY=$(cat .ecr_registry)

                        docker push $ECR_REGISTRY/$ECR_REPOSITORY:backend-$BUILD_NUMBER
                        docker push $ECR_REGISTRY/$ECR_REPOSITORY:backend-latest

                        docker push $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$BUILD_NUMBER
                        docker push $ECR_REGISTRY/$ECR_REPOSITORY:frontend-latest
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Garagebooking images pushed successfully to Amazon ECR.'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console output.'
        }

        always {
            sh 'rm -f .ecr_registry || true'
            sh 'docker image prune -f || true'
        }
    }
}
