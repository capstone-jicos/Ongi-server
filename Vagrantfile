# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Which box do you want?
  config.vm.box = "ubuntu/xenial64"

  # Forward 8080 port for web development
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 9229, host: 9229

  # Update apt Package Manager if OS is ubuntu
  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install python2.7 python-pip -y
  SHELL

  # Provision with ansible playbook
  config.vm.provision "ansible" do |ansible|
    ansible.verbose = "v"
    ansible.inventory_path = "provisioning/hosts"
    ansible.limit = "vagrant"
    ansible.playbook = "provisioning/main.yml"
  end
end
