var AWS = require('aws-sdk');
var S3 = require('s3');

var s3, es, iam, lambda, cloudwatchlogs,apigateway;
/**
 * update aws keys
 */
function updateConfig() {
	AWS.config.loadFromPath('./awsconfig.json');
	s3 = new AWS.S3(); //S3 Bucket interface object
	es = new AWS.ES(); //Elastic Search managed service interface object
	iam = new AWS.IAM(); //Create IAM service interface object
	lambda = new AWS.Lambda(); //Create lambda service interface object
	cloudwatchlogs = new AWS.CloudWatchLogs(); //Create Cloud Watch log instance
	apigateway = new AWS.APIGateway(); //Create new api gateway response
}
exports.updateConfig = updateConfig;

/**
 * Create bucket on AWS
 * @param bucketName 
 */
function createBucket(bucketName) {
	var params = {
		Bucket: bucketName
	};

	return new Promise((fulfill, reject) => {
		s3.createBucket(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	})
}

exports.createBucket = createBucket;

/**
 * List of bucket
 */
function listBucket() {
	return new Promise((fulfill, reject) => {
		s3.listBuckets(function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	})
}
exports.listBucket = listBucket;

/**
 * Upload file to S3 bucket
 * @param {*} fileName 
 * @param {*} filePath 
 * @param {*} bucketName 
 */
function uploadfileInBucket(fileName, filePath, bucketName) {
	var params = {
		Key: fileName,
		Body: filePath
	};
	var s3bucket = new AWS.S3({ params: { Bucket: bucketName } });
	return new Promise((fulfill, reject) => {
		s3bucket.upload(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});

}
exports.uploadfileInBucket = uploadfileInBucket;

/**
 * Upload Dir to S3 Bucket
 * @param bucketName: "./dist/"
 */

function uploadDirInBucket(bucketName, dirPath, accessKeyId, secretAccessKey) {
	var client = S3.createClient({
		maxAsyncS3: 20,     // this is the default 
		s3RetryCount: 3,    // this is the default 
		s3RetryDelay: 1000, // this is the default 
		multipartUploadThreshold: 20971520, // this is the default (20 MB) 
		multipartUploadSize: 15728640, // this is the default (15 MB) 
		s3Options: {
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			// any other options are passed to new AWS.S3() 
			// See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
		},
	});

	var params = {
		localDir: dirPath,
		deleteRemoved: true, // default false, whether to remove s3 objects that have no corresponding local file. 
		s3Params: {
			Bucket: bucketName
		},
	};
	var uploader = client.uploadDir(params);

	return new Promise((fulfill, reject) => {
		uploader.on('error', function (err) {
			//error occured
			reject(err);
		});

		uploader.on('end', function () {
			//done uploading
			fulfill('uploading done');
		});
	});
}

exports.uploadDirInBucket = uploadDirInBucket;


/**
 * Set AWS S3 bucket as website
 * @param {*} bucketName ,errDocument,IndexDocument
 */
function configureBucketAsWebsite(bucketName,errDocument='error.html',IndexDocument='index.html'){
	var params = {
	  Bucket: bucketName,
	  WebsiteConfiguration: { 
	    ErrorDocument: {
	      Key: errDocument 
	    },
	    IndexDocument: {
	      Suffix: IndexDocument
	    }
	  }
	};
	return new Promise((resolve, reject) => {
		s3.putBucketWebsite(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{
		  	resolve(data);
		  }     
		});
	});
}
exports.configureBucketAsWebsite = configureBucketAsWebsite;
/**
 * Set bucket policy
 * @param {*} bucketName
 */
function putBucketPolicy(bucketName){
	var policyobj={
		  "Version":"2012-10-17",
		  "Statement":[{
			"Sid":"PublicReadGetObject",
		      "Effect":"Allow",
			  "Principal": "*",
		      "Action":["s3:GetObject"],
		      "Resource":["arn:aws:s3:::"+bucketName+"/*"]
		    }
		  ]
		}
	var params = {
	  Bucket: bucketName, 
	  Policy: JSON.stringify(policyobj)
	};
	return new Promise((resolve, reject) => {
		s3.putBucketPolicy(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{
		  	resolve(data);
		  }
		});
	});
}
exports.putBucketPolicy = putBucketPolicy;

/**
 * Create Bucket Notification
 * @param {*} bucketName 
 * @param {*} arn 
 */

function putBucketNotificationConfiguration(bucketName, arn) {
	var params = {
		Bucket: bucketName,
		NotificationConfiguration: {
			LambdaFunctionConfigurations: [
				{
					Events: [
						"s3:ObjectCreated:*"
					],
					LambdaFunctionArn: arn
				}
			]
		}
	};

	return new Promise((fulfill, reject) => {
		s3.putBucketNotificationConfiguration(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});

	})
}
exports.putBucketNotificationConfiguration = putBucketNotificationConfiguration;

/**
 * add Permission to lambda function
 * @param {*} lambdaFunArn 
 * @param {*} bucketName 
 */

function addPermissionToS3(lambdaFunArn, bucketName) {
	var extractedSoruce = lambdaFunArn.split(":");
	var sourceAccountId = extractedSoruce[4];
	var SourceArn = "arn:aws:s3:::" + bucketName;
	var date = new Date();
	var uniqueid = date.getMilliseconds().toString();
	var params = {
		Action: 'lambda:InvokeFunction',
		FunctionName: lambdaFunArn,
		Principal: 's3.amazonaws.com',
		StatementId: uniqueid,
		SourceAccount: sourceAccountId,
		SourceArn: SourceArn
	};
	return new Promise((fulfill, reject) => {
		lambda.addPermission(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});
}

exports.addPermissionToS3 = addPermissionToS3;

/**
 * Create Elasticsearch domain
 * @param domainName
 */
function createESDomain(domainName) {
	var resource = "arn:aws:es:us-east-1:356967975209:domain/" + domainName + '/*';
	var policy = {
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {
					"AWS": "*"
				},
				"Action": "es:*",
				"Resource": resource
			}
		]
	};

	var params = {
		DomainName: domainName,
		AccessPolicies: JSON.stringify(policy),
		EBSOptions: {
			EBSEnabled: true,
			VolumeSize: 10,
			VolumeType: 'gp2'
		},
		ElasticsearchClusterConfig: {
			InstanceCount: 1,
			InstanceType: 't2.small.elasticsearch'
		},
		ElasticsearchVersion: '5.1'
	};
	return new Promise((fulfill, reject) => {
		es.createElasticsearchDomain(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});
}

exports.createESDomain = createESDomain;

/**
 * get Detail of elastic search domain
 * @param {*} domainName 
 */
function describeElasticsearchDomain(domainName) {
	var params = {
		DomainName: domainName
	};

	return new Promise((fulfill, reject) => {
		es.describeElasticsearchDomain(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});
}

exports.describeElasticsearchDomain = describeElasticsearchDomain;

/**
 * Create new role  
 * @param {*} roleName //awsbillingVisualizationRequiredPolicyManager
 * @param {*} path ///aws-billing-visualization/
 */

function createRole(roleName, path) {
	var policy = {
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {
					"Service": "lambda.amazonaws.com"
				},
				"Action": "sts:AssumeRole"
			}
		]
	};
	var params = {
		AssumeRolePolicyDocument: JSON.stringify(policy),
		RoleName: roleName,
		Path: path
	};

	return new Promise((fulfill, reject) => {
		iam.createRole(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});
}

exports.createRole = createRole;

/**
 * get role value
 * @param {*} roleName 
 */
function getRole(roleName) {
	var params = {
		RoleName: roleName
	};

	return new Promise((fulfill, reject) => {
		iam.getRole(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});
}

exports.getRole = getRole;

/**
 * Create Policy
 * @param {*} policyDocumentNo 
 * @param {*} resource 
 * @param {*} resourceArn  
 */
function createPolicy(policyDocumentNo, resource, resourceArn) {
	var policyDocument = '';
	var policyName = '';
	switch (policyDocumentNo) {
		case 1: policyDocument = {
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Action": [
						"s3:GetObject"
					],
					"Resource": "arn:aws:s3:::*"
				}
			]
		};
			policyName = 'LambdaS3Execution';
			break;
		case 2: policyDocument = {
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Action": [
						"lambda:InvokeFunction"
					],
					"Resource": [
						"*"
					]
				}
			]
		};
			policyName = 'LambdaInvokeAnotherLambda';
			break;
		case 3: policyDocument = {
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Action": "logs:CreateLogGroup",
					"Resource": resource + "*"
				},
				{
					"Effect": "Allow",
					"Action": [
						"logs:CreateLogStream",
						"logs:PutLogEvents"
					],
					"Resource": [resourceArn]
				}
			]
		};
			policyName = 'LambdaBasicExecution';
			break;
	}
	var params = {
		PolicyDocument: JSON.stringify(policyDocument),
		PolicyName: policyName
	};

	return new Promise((fulfill, reject) => {
		iam.createPolicy(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	})
}

exports.createPolicy = createPolicy;

/**
 * Attach policy to Role
 * @param {*} policyArn 
 * @param {*} roleName 
 */
function attachRolePolicy(policyArn, roleName) {
	var params = {
		PolicyArn: policyArn,
		RoleName: roleName
	};

	return new Promise((fulfill, reject) => {
		iam.attachRolePolicy(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	})
}
exports.attachRolePolicy = attachRolePolicy;

/**
 * Create a new lambda function
 * @param {*} bucketName //aws-data-visualization-lambda
 * @param {*} keyName //archive.zip
 * @param {*} funName //getIndexestesting
 * @param {*} role //arn:aws:iam::356967975209:role/aws-billing-visualization/awsbillingVisualizationRequiredPolicyManager
 * @param {*} desc //Description of lambda function
 * @param {*} esHost //
 */
function createFunction(bucketName, keyName, funName, role, desc, esHost, memorySize = 128) {
	var params = {
		Code: {
			S3Bucket: bucketName,
			S3Key: keyName,
		},
		FunctionName: funName,
		Handler: 'index.handler',
		Role: role,
		MemorySize: memorySize,
		Runtime: 'nodejs6.10',
		Description: desc,
		Environment: {
			Variables: {
				'host': esHost
			}
		}
	};

	return new Promise((fulfill, reject) => {
		lambda.createFunction(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});
}

exports.createFunction = createFunction;
/**
 * Create Log Group
 * @param {*} logGroupName 
 */

function createLogGroup(logGroupName) {
	var params = {
		logGroupName: logGroupName
	};
	return new Promise((fulfill, reject) => {
		cloudwatchlogs.createLogGroup(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	})
}
exports.createLogGroup = createLogGroup;

/**
 * Get Details of log group 
 * @param {*} logGroupName 
 */
function describeLogGroups(logGroupName) {
	var params = {
		logGroupNamePrefix: logGroupName
	};

	return new Promise((fulfill, reject) => {
		cloudwatchlogs.describeLogGroups(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	})
}

exports.describeLogGroups = describeLogGroups;

/**
 * Create Rest Api 
 * @param {*} apiName 
 * @param {*} desc 
 */
function createRestApi(apiName,desc) {
	var params = {
		name: apiName,
		description: desc
	};

	return new Promise((fulfill,reject)=>{
		apigateway.createRestApi(params, function (err, data) {
			if (err){
				reject(err);
			}else{
				fulfill(data);
			} 
		});
	});
	
}
exports.createRestApi=createRestApi;

/**
 * Get resource of api gateway
 * @param {*} apiId 
 */

function getResources(apiId){
	var params = {
	  restApiId: apiId
	};

	return new Promise((fulfill, reject) => {
		apigateway.getResources(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{
		  	fulfill(data);
		  }
		});
	});
}
exports.getResources=getResources;

/**
 * Create new resource for API Gateway
 * @param {*} parentId 
 * @param {*} pathPart 
 * @param {*} apiId 
 */
function createResource(parentId,pathPart,apiId){
	var params = {
	  parentId: parentId,
	  pathPart: pathPart, 
	  restApiId: apiId 
	};

	return new Promise((fulfill, reject) => {
		apigateway.createResource(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{
		  	fulfill(data); 
		  }         
		});
	});
}
exports.createResource=createResource;

/**
 * Add method to Api Gateway resource
 * @param {*} authorizationType 
 * @param {*} httpMethod 
 * @param {*} resourceId 
 * @param {*} restApiId 
 */
function putMethod(authorizationType='NONE',httpMethod,resourceId,restApiId){
	var params = {
	  authorizationType: authorizationType, 
	  httpMethod: httpMethod, 
	  resourceId: resourceId, 
	  restApiId: restApiId
	};
	return new Promise((fulfill, reject) => {
		apigateway.putMethod(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{ 
		  	fulfill(data); 
		  }
		});
	});
}
exports.putMethod=putMethod;

/**
 * Set the integration point 
 * @param {*} httpMethod 
 * @param {*} resourceId 
 * @param {*} apiId 
 * @param {*} type 
 * @param {*} uniqueIdentifier 
 */
function putIntegration(httpMethod,resourceId,apiId,type,uniqueIdentifier){
	var params = {
	  httpMethod: httpMethod, 
	  resourceId: resourceId,
	  restApiId: apiId, 
	  type: type,
	  integrationHttpMethod:'POST',
	  uri: uniqueIdentifier
	};

	return new Promise((fulfill, reject) => {
		apigateway.putIntegration(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{ 
		  	fulfill(data); 
		  }  
		});
	});
}
exports.putIntegration=putIntegration;


/**
 * Set the integration point 
 * @param {*} httpMethod 
 * @param {*} resourceId 
 * @param {*} apiId 
 * @param {*} type 
 * @param {*} uniqueIdentifier 
 */
function putIntegrationForCors(httpMethod,resourceId,apiId,type,requestTemplate){
	var params = {
	  httpMethod: httpMethod, 
	  resourceId: resourceId,
	  restApiId: apiId, 
	  type: type,
	  requestTemplates: requestTemplate
	};
	return new Promise((fulfill, reject) => {
		apigateway.putIntegration(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{ 
		  	fulfill(data); 
		  }  
		});
	});
}
exports.putIntegrationForCors=putIntegrationForCors;

/**
 * Set the method Response
 * @param {*} httpMethod 
 * @param {*} resourceId 
 * @param {*} apiId 
 * @param {*} responseModel 
 */
function putMethodResponse(httpMethod,resourceId,apiId,responseModel,responseParameters){
	var params = {
	  httpMethod: httpMethod, 
	  resourceId: resourceId, 
	  restApiId: apiId, 
	  statusCode: "200", 
	  responseModels: responseModel,
	  responseParameters:responseParameters
	};

	return new Promise((fulfill, reject) => {
		apigateway.putMethodResponse(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{ 
		  	fulfill(data); 
		  }
		});
	});
}
exports.putMethodResponse=putMethodResponse;

/**
 * Set the method Response
 * @param {*} httpMethod 
 * @param {*} resourceId 
 * @param {*} apiId 
 * @param {*} responseModel
 * @param {*} responseParameters 
 */
function putMethodResponseForCors(httpMethod,resourceId,apiId,responseModel,responseParameters){
	var params = {
	  httpMethod: httpMethod, 
	  resourceId: resourceId, 
	  restApiId: apiId, 
	  statusCode: "200", 
	  responseModels: responseModel,
	  responseParameters:responseParameters
	};

	return new Promise((fulfill, reject) => {
		apigateway.putMethodResponse(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{ 
		  	fulfill(data); 
		  }
		});
	});
}
exports.putMethodResponseForCors=putMethodResponseForCors;

/**
 * Set method integration response
 * @param {*} httpMethod 
 * @param {*} resourceId 
 * @param {*} apiId 
 * @param {*} responseTemplate 
 */
function putIntegrationResponse(httpMethod,resourceId,apiId,responseTemplate,responseParameters){
	var params = {
	  httpMethod: httpMethod, 
	  resourceId: resourceId, 
	  restApiId: apiId, 
	  statusCode: "200",
	  responseTemplates: responseTemplate,
	  responseParameters:responseParameters
	};

	return new Promise((fulfill, reject) => {
		apigateway.putIntegrationResponse(params, function(err, data) {
		  if (err){
		  	reject(data);
		  }else{
		  	fulfill(data);
		  }               		
		});
	});
	
}
exports.putIntegrationResponse=putIntegrationResponse;


/**
 * Set method integration response
 * @param {*} httpMethod 
 * @param {*} resourceId 
 * @param {*} apiId 
 * @param {*} responseTemplate 
 * @param {*} responseParameters
 */
function putIntegrationResponseForCors(httpMethod,resourceId,apiId,responseTemplate,responseParameters){
	var params = {
	  httpMethod: httpMethod, 
	  resourceId: resourceId, 
	  restApiId: apiId, 
	  statusCode: "200",
	  responseTemplates: responseTemplate,
	  responseParameters:responseParameters
	};

	return new Promise((fulfill, reject) => {
		apigateway.putIntegrationResponse(params, function(err, data) {
		  if (err){
		  	reject(data);
		  }else{
		  	fulfill(data);
		  }               		
		});
	});
	
}
exports.putIntegrationResponseForCors=putIntegrationResponseForCors;

/**
 * Deploy API
 * @param {*} apiId 
 * @param {*} stageName 
 */
function createDeployment(apiId,stageName='prod'){
	var params = {
	  restApiId: apiId, 
	  stageName: stageName
	};

	return new Promise((fulfill, reject) => {
		apigateway.createDeployment(params, function(err, data) {
		  if (err){
		  	reject(err);
		  }else{ 
		  	fulfill(data); 
		  }
		});
	});
}
exports.createDeployment=createDeployment;

/**
 * Grant permission that allow amazone api gateway to invoke the lambda function
 * @param {*} apiGatewayArn 
 * @param {*} functionName 
 */
function addPermission(apiGatewayArn, functionName) {
	var date = new Date();
	var uniqueid = date.getMilliseconds().toString();

	var params = {
		Action: 'lambda:InvokeFunction',
		FunctionName: functionName,
		Principal: 'apigateway.amazonaws.com',
		StatementId: uniqueid,
		SourceArn: apiGatewayArn
	};
	return new Promise((fulfill, reject) => {
		lambda.addPermission(params, function (err, data) {
			if (err) {
				reject(err);
			} else {
				fulfill(data);
			}
		});
	});
}
exports.addPermission=addPermission;
/**
 * Get Api gateway endpoint URL
 * @param {*} apiId 
 * @param {*} region 
 * @param {*} stage 
 */
function getApiInvokeUrl(apiId,region,stage){
	var apiUrl='';
	if(apiId!=='' && region!=='' && stage!==''){
		apiUrl="https://"+apiId+".execute-api."+region+".amazonaws.com/"+stage+"/";
	}
	return apiUrl;
}
exports.getApiInvokeUrl=getApiInvokeUrl;




