# -*- mode: ruby -*-
# vi: set ft=ruby :

# Provisioning script
$script = <<SCRIPT
echo "Vagrant provisioning start"

# install nodejs and npm
apt-get update -y -q
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get install -y -q nodejs
apt-get update -y -q

echo "Vagrant provisioning complete"
SCRIPT

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, inline: $script
  config.vm.synced_folder ".", "/vagrant", :mount_options => ["dmode=777", "fmode=777"]
  config.vm.network :forwarded_port, guest: 3000, host: 3000
end
