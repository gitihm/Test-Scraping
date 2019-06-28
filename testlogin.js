
const request = require('request')
const cheerio = require('cheerio')
var Q = require('q');

var jar = request.jar();
var deferred = Q.defer();
var baseLogin_url = 'https://sso.psu.ac.th/adfs/ls/?wa=wsignin1.0&wtrealm='
var sis_url = 'https://sis-phuket2.psu.ac.th'

getLoginViewState = function(username, password, jar){
	console.log('getLoginViewState');
	var deferred = Q.defer();
	request({
		url : sis_url+'/WebRegist2005/Login.aspx',
		method : 'get',
		jar : jar,
		followAllRedirects : true
		}, function(err, response, body){
            console.log("Status : "+response.statusCode)
			if(err){
				deferred.reject(err);
			}
			else{
				var $ = cheerio.load(body);
				var __VIEWSTATE = $("#loginMessage").text();
				deferred.resolve({
					username: username,
					password: password,
					__VIEWSTATE : __VIEWSTATE,
					jar : jar
                });
                console.log(__VIEWSTATE)
			}
	});
	return deferred.promise;
};
var uellogin = 'https://sso.psu.ac.th/adfs/ls/?wa=wsignin1.0&wtrealm=https%3a%2f%2fsis-phuket2.psu.ac.th%2f&wctx=rm%3d0%26id%3dpassive%26ru%3d%252fLogin.aspx&wct=2019-06-28T07%3a54%3a36Z&wreply=https%3a%2f%2fsis-phuket2.psu.ac.th%2f'
doLogin = function doLogin(obj){
	console.log('doLogin');
	var jar = obj.jar;
	var deferred = Q.defer();
    var std_profile = {};
    console.log("Before post")
	try {
        request.post({
            url : sis_url+'/WebRegist2005/Login.aspx\'',
            method : 'post',
            jar : jar,
            followAllRedirects : true,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-TH,en-US;q=0.9,en;q=0.8,th;q=0.7',
                'Cache-Control': 'max-age=0',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'MSISLoopDetectionCookie=MjAxOS0wNi0yODowODo1NTowMlpcMQ==',
                'Host': 'sso.psu.ac.th',
                'Origin': 'https://sso.psu.ac.th',
                'Referer': 'https://sso.psu.ac.th/adfs/ls/?wa=wsignin1.0&wtrealm=https%3a%2f%2fsis-phuket2.psu.ac.th%2f&wctx=rm%3d0%26id%3dpassive%26ru%3d%252fStudent%252fDefault.aspx&wct=2019-06-28T09%3a08%3a56Z&wreply=https%3a%2f%2fsis-phuket2.psu.ac.th%2f',
                
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
            },
            formData : {
                UserName: obj.username,
                Password:  obj.password,
                AuthMethod: 'FormsAuthentication'
            }
            
        }, function(err, res, body){
            if(err){
                deferred.reject(err);
                console.log("Login can't",err)
            }
            else{
                
                $ = cheerio.load(body);
                var studentInfoString = $("#ctl00_ctl00_LoginView1_LoginName1").text();
                if(studentInfoString == ''){
                    deferred.reject('Username or Password Incorrect');
                    console.log('Username or Password Incorrect');
                }
                console.log('NAME : '+studentInfoString);
                var studentInfo = studentInfoString.split(" - ");
                std_profile.std_id = studentInfo[0];
                std_profile.std_name = studentInfo[1];
                deferred.resolve({
                    std_profile: std_profile,
                    jar: jar
                });
            }
        });
    } catch (error) {
        console.log(error)
    }
    console.log("After post")
	return deferred.promise;
};
getLoginViewState(IDSTAUTS,PASS,jar)
.then(doLogin)
