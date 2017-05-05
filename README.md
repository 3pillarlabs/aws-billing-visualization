## Synopsis
AWS biiling visualization shows AWS usage details in product view, geographical view and data table view within date range.
User can drill down report by selecting product and/or region through product and geographical view. Further drill down can 
be done using table view filters.
This project used Node JS, Angular2 JS, ElasticSearch, D3 JS, AWS lambda, Bootstrap, Bootstrap Tour, Font-Awesome.
Elasticsearch is a highly scalable open-source schema-free full-text search and analytics engine that are accessible 
through RESTful HTTP/JSON API. It allows you to store, search, and analyze big volumes of data quickly and in near real time. 

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Vagrant - [Download & Install Vagrant](https://www.vagrantup.com/downloads.html)
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
* ElasticSearch - [Download & Install ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html)

## Setup
* Change host url of elasticsearch in model/elasticsearch.js 
* go to root of project folder and run 
```bash
$ vagrant up
```
* To ssh in vagrant 
```bash
$ vagrant ssh
```
* Navigate to vagrant folder
```bash
$ cd /vagrant/
```
* Install npm modules
```bash
$ npm install
```
* Start project
```bash
$ npm start
```
* browse to http://localhost:3000 to view your project.

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.