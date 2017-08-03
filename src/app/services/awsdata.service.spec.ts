import {TestBed, inject, tick} from '@angular/core/testing';
import {AwsdataService} from './awsdata.service';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {Response, ResponseOptions, Http, ConnectionBackend, BaseRequestOptions, RequestOptions} from '@angular/http';
import {Observable} from "rxjs";


describe('Service: Awsdata', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    {provide: RequestOptions, useClass: BaseRequestOptions},
                    {provide: ConnectionBackend, useClass: MockBackend},
                    Http,
                    AwsdataService
                ]
            });
        });

        it('should inject the service', inject([AwsdataService], (service: AwsdataService) => {
            expect(service).toBeTruthy();
        }));

        describe('isServerless', () => {
           it('should return true if serverless', inject([AwsdataService], (service: AwsdataService) => {
                service.serverless = true;
                expect(service.isServerless()).toBeTruthy();
            })); 

           it('should return false id non serverless', inject([AwsdataService], (service: AwsdataService) => {
                service.serverless = false;
                expect(service.isServerless()).toBeFalsy();
            }));  
        });

        it('should get all aws resource for non serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/getalldata');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getAllAwsResource(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get all aws resource for serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};
                service.serverless = true;

                service.apiUrls.detailReportData = 'test';
                backend.connections.subscribe((c: MockConnection) => {                    
                    expect(c.request.url).toEqual('test');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getAllAwsResource(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get min max date range for non serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = 'test-string';
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/getMinMaxDate/test-string');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getMinMaxDateRange(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should get min max date range for serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = 'test-string';
                service.serverless = true;
                service.apiUrls.recordInfo = 'testUrl';

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('testUrl');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });                

                var returnData = service.getMinMaxDateRange(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should verify elastic index for non serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = '1';
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/isIndexExists/1');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.verifyElasticIndex(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should verify elastic index for serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = '1';
                service.serverless = true;
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('https://spyk0l1ihj.execute-api.us-east-1.amazonaws.com/prod/setup');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.verifyElasticIndex(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get group service data for non serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/getGroupServicedata');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getGroupServicedata(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get group service data for serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};
                service.serverless = true;
                service.apiUrls.groupedServiceData = 'testUrl';
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('testUrl');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getGroupServicedata(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get all indexes for non serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/indexes');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getAllIndexes();

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should get all indexes for serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                service.serverless = true;
                service.apiUrls.getIndexes = 'testUrl';

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('testUrl');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getAllIndexes();

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should verify and save AWS data', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/verifyAndSaveAWSData');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.verifyAndSaveAWSData(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get regions data for non serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/isElasticConnected');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.verifyElasticConnection();

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get regions data for serverless', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                service.serverless = true;

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('https://spyk0l1ihj.execute-api.us-east-1.amazonaws.com/prod/setup');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.verifyElasticConnection();

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should upload sample file', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/uploadSampleFile');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.uploadSampleFile(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should setup static site', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/setupStaticWebsite');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.setupStaticWebsite(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should validate and save access key', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/validateAndSaveAccessKey');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.validateAndSaveAccessKey(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should create ES domain', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/createESDomain');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.createESDomain(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should get ES end point', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = 'testDomain';

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/getElasticsearchDomainInfo/'+data);
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.getESEndPoint(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should create ES index', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/createESIndex');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.createESIndex(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

        it('should create lambdas for setup', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/createLambdasForSetup');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.createLambdasForSetup(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should create role with permission', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/createRolewithPermission');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.createAwsRole();

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should create apis for setup', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/createApisForSetup');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.createApisForSetup(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should create apis Json file', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/creatApisJsonFile');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.creatApisJsonFile(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should create apis Json file', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/setupAwsStaticWebsite');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.setupAwsStaticWebsite(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should setup Aws billing CSV bucket', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/setupBillingBucket');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.setupAwsBillingCSVBucket(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));


        it('should enable cors for Api', inject([ConnectionBackend, AwsdataService],
            (backend: MockBackend,
             service: AwsdataService) => {
                // Arrange
                let items = null;
                let data = {data: 'test'};

                backend.connections.subscribe((c: MockConnection) => {
                    expect(c.request.url).toEqual('api/enableCorsForApi');
                    c.mockRespond(new Response(new ResponseOptions({body: '[{"item":"Test"}]'})));
                });

                var returnData = service.enableCorsForApi(data);

                // Act
                returnData.subscribe((q) => {
                    items = q;
                });

                // Assert
                backend.verifyNoPendingRequests();
                expect(items).toEqual([{item:'Test'}]);
        }));

    });
