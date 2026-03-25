pipeline {
    agent any
    environment {
        PATH = "/opt/sonar-scanner/bin:$PATH"
      }
    stages {
        stage('SonarQube analysis for Feature-Branch') {
              when {
                    expression {return (env.CHANGE_BRANCH ==~ /^(feature|fixes|hotfix)\/.*$/) && env.CHANGE_TARGET == 'development' }
              }
              steps {
                    withSonarQubeEnv('TASKOPAD_SONAR_HOST_URL') {
                      sh 'sonar-scanner -Dsonar.projectKey=invoice-creation-nodejs -Dsonar.projectName="invoice-creation-nodejs" -Dsonar.qualitygate.wait=true -Dsonar.login=15533453e6ca4215ae40a2b7632327202d0a4136 || true'                    
                      echo "Auto mergening"
                      echo "SOURCE_BRANCH: ${env.CHANGE_BRANCH } ----> TARGET_BRANCH: ${env.CHANGE_TARGET}"
                      sh 'rm -rf invoice-creation-nodejs'
                      sh 'git clone git@bitbucket.org-yashushah:solutionanalystspvtltd/invoice-creation-nodejs.git'
                      dir('invoice-creation-nodejs')
                      {
                      sh 'git fetch origin'
                      sh 'git branch -a' 
                      sh 'git config --global user.email yashvi.shah@solutionanalysts.com'
                      sh 'git config --global user.name YashuShah'
                      sh 'git checkout $CHANGE_TARGET' 
                      sh 'git merge origin/$CHANGE_BRANCH'
                      sh 'git push origin $CHANGE_TARGET'
                      } 
                  }
              }
          }
        stage('Build') {
               when { branch 'development'}
            steps {
                sh "DOCKER_BUILDKIT=1 docker build --output type=local,dest=out -t invoice/creation:dev ."
                sh "cp -r ./out/dist ./dist/ && cp -r ./out/node_modules ./node_modules && rm -rf ./out && ls -lart"
                sh ''' echo "Build created" '''
                }
        }
        
        stage('Deploy') {
               when { branch 'development'}
            steps {
                sh '''rsync -zvhr -e "ssh -o StrictHostKeyChecking=no" . shoebranger@192.168.3.165:/home/shoebranger/Invoice-Creation/invoice-creation-nodejs/'''
             //   sh '''rsync -zvhr -e "ssh -o StrictHostKeyChecking=no" ./node_modules/ shoebranger@192.168.3.165:/home/shoebranger/Invoice-Creation/invoice-creation-nodejs/node_modules/'''
                sh ''' ssh -o StrictHostKeyChecking=no shoebranger@192.168.3.165 "/home/shoebranger/.nvm/versions/node/v18.17.1/bin/pm2 restart invoice-creation-nodejs" '''
                sh "rm -rf ./dist && rm -rf ./node_modules && ls -lrta"
            }
        }
        stage('Build-master') {
               when { branch 'master'}
            steps {
                sh "DOCKER_BUILDKIT=1 docker build --output type=local,dest=out -t invoice/creation:dev ."
                sh "cp -r ./out/dist ./dist/ && cp -r ./out/node_modules ./node_modules && rm -rf ./out && ls -lart"
                sh ''' echo "Build created" '''
                }
        }
        
        stage('Deploy-master') {
               when { branch 'master'}
            steps {
                sh '''rsync -zvhr -e "ssh -o StrictHostKeyChecking=no" ./dist/ ubuntu@ec2-65-1-69-62.ap-south-1.compute.amazonaws.com:/home/ubuntu/invoice-creation-nodejs/dist/'''
                sh '''rsync -zvhr -e "ssh -o StrictHostKeyChecking=no" ./node_modules/ ubuntu@ec2-65-1-69-62.ap-south-1.compute.amazonaws.com:/home/ubuntu/invoice-creation-nodejs/node_modules/'''
                sh ''' ssh -o StrictHostKeyChecking=no ubuntu@ec2-65-1-69-62.ap-south-1.compute.amazonaws.com "pm2 restart invoice-creation" '''
                sh "rm -rf ./dist && rm -rf ./node_modules && ls -lrta"
            }
        }
               
    }
} 