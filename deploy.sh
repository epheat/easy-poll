#!/usr/bin/env bash

USER='deploy'

SERVER=''
if [[ "production" = $1 ]]; then
  ROOT='/home/deploy/easy-poll'
  SERVER='138.197.109.222'
# elif [[ "staging" = $1 ]]; then
  # ROOT='/home/ubuntu/new_mvp'
  # SERVER='staging.infinite.industries'
else
  echo Please specify environment to deploy to.
  echo Usage: ./deploy.sh environment
  echo Example: ./deploy.sh staging
  exit
fi

npm run build

ssh $USER@$SERVER << EOF
  cd $ROOT
  echo 'Updating sources'
  git reset --hard HEAD
  git checkout master
  git pull
  echo 'Installing npm packages'
  npm install --production
  echo 'Restarting'
  forever stop easypoll
  rm /home/$USER/.forever/easypoll.log
  forever start --uid easypoll server.js
  echo 'Done!'
EOF

scp ./public/dist/build.js $USER@$SERVER:$ROOT/public/dist
