FROM node:alpine

WORKDIR /usr/src/app
RUN mkdir -p ./public/images ./data/challenges
COPY ./bin ./bin
ADD https://download.microsoft.com/download/3/E/1/3E1C3F21-ECDB-4869-8368-6DEBA77B919F/kagglecatsanddogs_3367a.zip \
	./bin/kagglecatsanddogs_3367a.zip
RUN cd ./bin; sh setup.sh
COPY package*.json ./
RUN npm install
EXPOSE 3000
RUN npm install -g nodemon
CMD [ "nodemon" ]
