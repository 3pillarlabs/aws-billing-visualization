import {TestBed, inject, tick} from '@angular/core/testing';
import {AwsdataService} from './awsdata.service';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {Response, ResponseOptions, Http, ConnectionBackend, BaseRequestOptions, RequestOptions} from '@angular/http';


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

        it('should get all aws resource', inject([ConnectionBackend, AwsdataService],
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


        it('should get min max date range', inject([ConnectionBackend, AwsdataService],
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

        it('should verify elastic index', inject([ConnectionBackend, AwsdataService],
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

        it('should get group service data', inject([ConnectionBackend, AwsdataService],
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

        it('should get all indexes', inject([ConnectionBackend, AwsdataService],
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

        it('should get regions data', inject([ConnectionBackend, AwsdataService],
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


    });
