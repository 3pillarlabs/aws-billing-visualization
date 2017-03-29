var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('./server.js');
var should = chai.should();

chai.use(chaiHttp);

describe('GET getMinMaxDate api', function () {
  describe('it should return object containing property aggregations', function () {
    it('it should return object', (done) => {
      chai.request(server)
        .get('/api/getMinMaxDate/aws-billing')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('aggregations');
          res.body.should.have.deep.property('aggregations.max_date');
          res.body.should.have.deep.property('aggregations.min_date');
          done();
        });
    });
  });
});



describe('GET Unique Product and Regions with list data within date range', function () {
  it('it should return object with property aggregations containing products and regions and record list', (done) => {
    var awsobj = {
      company: 'aws-billing',
      strdate: '2017-01-01',
      enddate: '2018-01-31',
      detailreport:'',
      product:'',
      region:''
    }

    chai.request(server)
      .post('/api/getGroupServicedata')
      .send(awsobj)
      .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
        done();
      });
  })
})