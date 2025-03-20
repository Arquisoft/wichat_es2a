### Monitoring (Prometheus and Grafana)
In this step we are going use [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/) to monitor the restapi. First step is modifying the restapi launch to capture profiling data. In nodejs this is very easy. After installing the required packages (express-prom-bundle and prom-client), we need to modify the `gatewayservice/gateway-service.js` in order to capture the profiling data adding:
```javascript
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);
```
Now when we launch the api, in [http://localhost:8000/metrics](http://localhost:8000/metrics) we have a metrics endpoint from which get the profiling data. The idea here is to have another piece of software running (called [Prometheus](https://prometheus.io/)) that will get this data, let say, every five seconds. Then, another software called [Grafana](https://grafana.com/) will display this using beautiful charts.

For running Prometheus and Grafana we can use several docker images. Check `docker-compose.yml` to see how these images are launched. 

<mark>Note: in the `prometheus.yml` we are telling prometheus where is our restapi metrics end point. In Grafana `datasources/datasource.yml` we are telling where to find prometheus data.</mark>

<mark>In both configuration files we need to stablish the uris of restapi metrics and the prometheus datasource. Right now they are configured to work using docker-compose network. If you want to use these individual docker commands, you need to change these uris to point to localhost</mark>

Once launched all the system is launched (see the Quick Start Guide), we can simulate a few petitions to our webservice:

```
sudo apt-get install apache2-utils
ab -m GET -n 10000 -c 100 http://localhost:8000/health
```
In the Grafana dashboard we can see how the number of petitions increases dramatically after the call.

A good reference with good explanations about monitoring in nodejs can be found [here](https://github.com/coder-society/nodejs-application-monitoring-with-prometheus-and-grafana).
