# wichat_es2a

[![Actions Status](https://github.com/arquisoft/wichat_es2a/workflows/Build/badge.svg)](https://github.com/arquisoft/wichat_es2a/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es2a&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es2a)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es2a&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es2a)
[![GitHub issues](https://img.shields.io/github/issues/arquisoft/wichat_es2a)](https://github.com/arquisoft/wichat_es2a/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed/arquisoft/wichat_es2a)](https://github.com/Arquisoft/wichat_es2a/issues?q=is%3Aissue%20state%3Aclosed)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/arquisoft/wichat_es2a)](https://github.com/arquisoft/wichat_es2a/pulls)
[![Closed PRs](https://img.shields.io/github/issues-pr-closed/arquisoft/wichat_es2a)](https://github.com/Arquisoft/wichat_es2a/pulls?q=is%3Apr+is%3Aclosed)



<p float="left">
<img src="https://github.com/Arquisoft/wichat_es2a/blob/master/webapp/src/media/logoWiChat.svg" height="200">
</p>

## Development Team 👥💻
| 👤 Name                        | 📧 Email                    | 🐱 GitHub                                                                 |
| :----------------------------: | :------------------------: | :------------------------------------------------------------------------: |
| Natalia Blanco Agudín          | UO295340@uniovi.es          | [![GitHub](https://img.shields.io/badge/GitHub-NataliaBlancoAgudin-brightgreen)](https://github.com/NataliaBlancoAgudin) |
| David Covián Gómez             | UO295168@uniovi.es          | [![GitHub](https://img.shields.io/badge/GitHub-DavidCG27-brightgreen)](https://github.com/DavidCG-27)           |
| Darío Cristóbal González       | UO294401@uniovi.es          | [![GitHub](https://img.shields.io/badge/GitHub-daariio92-brightgreen)](https://github.com/daariio92)            |
| Hugo Fernández Rodríguez       | UO289157@uniovi.es          | [![GitHub](https://img.shields.io/badge/GitHub-hugofedez-brightgreen)](https://github.com/hugo-fdez)            |
| Marcos Llanos Vega             | UO218982@uniovi.es          | [![GitHub](https://img.shields.io/badge/GitHub-softwaremarcos-brightgreen)](https://github.com/softwaremarcos)        |
| Hugo Prendes Menéndez          | UO288294@uniovi.es          | [![GitHub](https://img.shields.io/badge/GitHub-prendess-brightgreen)](https://github.com/prendess)              |

## Demo 🎥

[![Demo Video](https://img.youtube.com/vi/KigafFwNIjs/0.jpg)](https://youtu.be/KigafFwNIjs)
> ▶️ Watch a demo of the project in action by clicking the image above.

## Context 🛠️
This is a base project for the Software Architecture course in 2024/2025. It is a basic application composed of several components.

- **User service**. Express service that handles the insertion of new users in the system.
- **Auth service**. Express service that handles the authentication of users.
- **LLM service**. Express service that handles the communication with the LLM.
- **Wikidata service**: Express service that handles teh core game logic by retrieving and processing questions data from Wikidata
- **Math Game service**: Express service that offers a math-based mini-game, generating and validating math questions
- **Group service**: express service responsible for group creation, group messaging and user membership in groups.
- **Gateway service**. Express service that is exposed to the public and serves as a proxy to the two previous ones.
- **Webapp**. React web application that uses the gateway service to allow basic login and new user features.

Both the user and auth service share a Mongo database that is accessed with mongoose.

## Quick start guide

First, clone the project:

```git clone git@github.com:arquisoft/wichat_es2a.git```

### LLM API key configuration

In order to communicate with the LLM integrated in this project, we need to setup an API key. Two integrations are available in this propotipe: gemini and empaphy. The API key provided must match the LLM provider used.

We need to create two .env files. 
- The first one in the webapp directory (for executing the webapp using ```npm start```). The content of this .env file should be as follows:
```
REACT_APP_LLM_API_KEY="YOUR-API-KEY"
```
- The second one located in the root of the project (along the docker-compose.yml). This .env file is used for the docker-compose when launching the app with docker. The content of this .env file should be as follows:
```
LLM_API_KEY="YOUR-API-KEY"
```

Note that these files must NOT be uploaded to the github repository (they are excluded in the .gitignore).

An extra configuration for the LLM to work in the deployed version of the app is to include it as a repository secret (LLM_API_KEY). This secret will be used by GitHub Action when building and deploying the application.


### Launching Using docker
For launching the propotipe using docker compose, just type:
```docker compose --profile dev up --build```

### Component by component start
First, start the database. Either install and run Mongo or run it using docker:

```docker run -d -p 27017:27017 --name=my-mongo mongo:latest```

You can use also services like Mongo Altas for running a Mongo database in the cloud.

Now launch the auth, user and gateway services. Just go to each directory and run `npm install` followed by `npm start`.

Lastly, go to the webapp directory and launch this component with `npm install` followed by `npm start`.

After all the components are launched, the app should be available in localhost in port 3000.

## Deployment
For the deployment, we have several options. The first and more flexible is to deploy to a virtual machine using SSH. This will work with any cloud service (or with our own server). Other options include using the container services that all the cloud services provide. This means, deploying our Docker containers directly. Here I am going to use the first approach. I am going to create a virtual machine in a cloud service and after installing docker and docker-compose, deploy our containers there using GitHub Actions and SSH.

### Machine requirements for deployment
The machine for deployment can be created in services like Microsoft Azure or Amazon AWS. These are in general the settings that it must have:

- Linux machine with Ubuntu > 20.04 (the recommended is 24.04).
- Docker installed.
- Open ports for the applications installed (in this case, ports 3000 for the webapp and 8000 for the gateway service).

Once you have the virtual machine created, you can install **docker** using the following instructions:

```ssh
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install docker-ce
sudo usermod -aG docker ${USER}
```

### Continuous delivery (GitHub Actions)
Once we have our machine ready, we could deploy by hand the application, taking our docker-compose file and executing it in the remote machine. In this repository, this process is done automatically using **GitHub Actions**. The idea is to trigger a series of actions when some condition is met in the repository. The precondition to trigger a deployment is going to be: "create a new release". The actions to execute are the following:

![imagen](https://github.com/user-attachments/assets/7ead6571-0f11-4070-8fe8-1bbc2e327ad2)


As you can see, unitary tests of each module and e2e tests are executed before pushing the docker images and deploying them. Using this approach we avoid deploying versions that do not pass the tests.

The deploy action is the following:

```yml
deploy:
    name: Deploy over SSH
    runs-on: ubuntu-latest
    needs: [docker-push-userservice,docker-push-authservice,docker-push-llmservice,docker-push-gatewayservice,docker-push-webapp]
    steps:
    - name: Deploy over SSH
      uses: fifsky/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        user: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_KEY }}
        command: |
          wget https://raw.githubusercontent.com/arquisoft/wichat_es2a/master/docker-compose.yml -O docker-compose.yml
          docker compose --profile prod down
          docker compose --profile prod up -d --pull always
```

This action uses three secrets that must be configured in the repository:
- DEPLOY_HOST: IP of the remote machine.
- DEPLOY_USER: user with permission to execute the commands in the remote machine.
- DEPLOY_KEY: key to authenticate the user in the remote machine.

Note that this action logs in the remote machine and downloads the docker-compose file from the repository and launches it. Obviously, previous actions have been executed which have uploaded the docker images to the GitHub Packages repository.
