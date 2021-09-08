#!groovy

// Project Settings for Deployment
String PROJECTNAME = "pakjekraam"
String CONTAINERDIR = "."
String PRODUCTION_BRANCH = "main"
String INFRASTRUCTURE = 'secure'
String PLAYBOOK = 'deploy.yml'

// All other data uses variables, no changes needed for static
String CONTAINERNAME = "fixxx/${PROJECTNAME}"
String DOCKERFILE = "Dockerfile"
String BRANCH = "${env.BRANCH_NAME}"

def tryStep(String message, Closure block, Closure tearDown = null) {
    try {
        block();
    }
    catch (Throwable t) {
        slackSend message: "${env.JOB_NAME}: ${message} failure ${env.BUILD_URL}", channel: '#salmagundi_ci', color: 'danger'
        throw t;
    }
    finally {
        if (tearDown) {
            tearDown();
        }
    }
}

def retagAndPush(String imageName, String newTag) {
    def regex = ~"^https?://"
    def dockerReg = "${DOCKER_REGISTRY_HOST}" - regex
    sh "docker tag ${dockerReg}/${imageName}:${env.BUILD_NUMBER} ${dockerReg}/${imageName}:${newTag}"
    sh "docker push ${dockerReg}/${imageName}:${newTag}"
}

node {
    // Get a copy of the code
    stage("Checkout") {
        checkout scm
}

    // Build the Dockerfile in the $CONTAINERDIR and push it to docker registry
    stage("Build develop image") {
        tryStep "build", {
            sh "git rev-parse HEAD > version_file"
            sh 'cat version_file'

            docker.withRegistry("${DOCKER_REGISTRY_HOST}",'docker_registry_auth') {
                image = docker.build("${CONTAINERNAME}:${env.BUILD_NUMBER}","-f ${DOCKERFILE} ${CONTAINERDIR}")
                image.push()

            }
        }
    }
}

// On main branch, fetch the container, tag with production and latest and deploy to production
if (BRANCH == "${PRODUCTION_BRANCH}") {
    stage('Waiting for approval') {
        slackSend channel: '#salmagundi_ci', color: 'warning', message: "${PROJECTNAME} is waiting for Acceptance Release - please confirm"
        input "Deploy to Acceptance?"
    }

    node {
        stage("Deploy to ACC") {
            tryStep "deployment", {
                docker.withRegistry("${DOCKER_REGISTRY_HOST}",'docker_registry_auth') {
                    docker.image("${CONTAINERNAME}:${env.BUILD_NUMBER}").pull()
                    retagAndPush("${CONTAINERNAME}", "acceptance")
                }

                build job: 'Subtask_Openstack_Playbook',
                        parameters: [
                                [$class: 'StringParameterValue', name: 'INFRASTRUCTURE', value: "${INFRASTRUCTURE}"],
                                [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
                                [$class: 'StringParameterValue', name: 'PLAYBOOK', value: "${PLAYBOOK}"],
                                [$class: 'StringParameterValue', name: 'PLAYBOOKPARAMS', value: "-e cmdb_id=app_${PROJECTNAME}"],
                                [$class: 'StringParameterValue', name: 'STATIC_CONTAINER', value: "${PROJECTNAME}"],
                        ]
            }
        }
    }

    stage('Waiting for approval') {
        slackSend channel: '#salmagundi_ci', color: 'warning', message: "${PROJECTNAME} is waiting for Production Release - please confirm"
        input "Deploy to Production?"
    }

    node {
        stage("Deploy to PROD") {
            tryStep "deployment", {
                docker.withRegistry("${DOCKER_REGISTRY_HOST}",'docker_registry_auth') {
                    docker.image("${CONTAINERNAME}:${env.BUILD_NUMBER}").pull()
                    retagAndPush("${CONTAINERNAME}", "production")
                    retagAndPush("${CONTAINERNAME}", "latest")
                }

                build job: 'Subtask_Openstack_Playbook',
                        parameters: [
                                [$class: 'StringParameterValue', name: 'INFRASTRUCTURE', value: "${INFRASTRUCTURE}"],
                                [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
                                [$class: 'StringParameterValue', name: 'PLAYBOOK', value: "${PLAYBOOK}"],
                                [$class: 'StringParameterValue', name: 'PLAYBOOKPARAMS', value: "-e cmdb_id=app_${PROJECTNAME}"],
                                [$class: 'StringParameterValue', name: 'STATIC_CONTAINER', value: "${PROJECTNAME}"],
                        ]
            }
        }
    }
}
