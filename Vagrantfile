# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.10"
  config.vm.synced_folder ".", "/home/vagrant/shared"
  config.vm.network "forwarded_port", guest: 8000, host: 8000

  config.vm.provision "shell", inline: <<-SHELL
    # Node.js
    sudo apt-get update
    sudo apt-get install -y curl wget
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential g++ gyp

    # PostgreSQL
    sudo echo 'deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main' >> /etc/apt/sources.list.d/pgdg.list
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    sudo apt-get update
    sudo apt-get install -y postgresql-9.6
    sudo -u postgres psql -c "CREATE ROLE vagrant WITH LOGIN PASSWORD 'vagrant'"
    sudo -u postgres psql -c "CREATE DATABASE vagrant WITH OWNER vagrant"
    export PGPASSWORD='vagrant'

    # Redis
    cd /tmp
    wget http://download.redis.io/releases/redis-3.2.9.tar.gz
    tar xzf redis-3.2.9.tar.gz
    cd /tmp/redis-3.2.9
    make
    sudo make install
    mkdir /etc/redis
    cp /tmp/redis-3.2.9/redis.conf /etc/redis
    cd /etc/redis
    sed -i -E "s/^daemonize(.*)/daemonize yes/g" redis.conf

    # Project
    mkdir /home/vagrant/authentication-service
    sudo chown vagrant /home/vagrant/authentication-service
    echo 'alias sync="cp -r /home/vagrant/shared/{docker,src,.gitignore,gulpfile.js,package.json,README.md,Vagrantfile} /home/vagrant/authentication-service"' >> /home/vagrant/.bashrc

  SHELL
end
