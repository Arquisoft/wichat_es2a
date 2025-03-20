# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run prod`
It executes the production version using the package `serve`. For this command to work you need the `build` directory which is created using `npm run build`.

### Unitary tests (`npm test`)

Unitary tests can be found in the same directory where the react components lie. Each react component (for instance, App.js), will have its own test file (App.test.js).

Here is an example of the tests for App.js:

```javascript
test('renders welcome message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/Welcome to the 2025 edition of the Software Architecture course/i);
  expect(welcomeMessage).toBeInTheDocument();
});
```
This example is pretty simple as it is only checking that the app is rendering correctly. Other tests are more complex as they depend on other components. As we are performing unitary testing, we need to decouple these dependencies, mocking the components that we do not want to test. For instance:

```javascript
describe('AddUser component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should add user successfully', async () => {
    render(<AddUser />);

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const addUserButton = screen.getByRole('button', { name: /Add User/i });

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/adduser').reply(200);

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });

    // Trigger the add user button click
    fireEvent.click(addUserButton);

    // Wait for the Snackbar to be open
    await waitFor(() => {
      expect(screen.getByText(/User added successfully/i)).toBeInTheDocument();
    });
  });
...
```
This would be a test for adding a user in the `AddUser` component. As you can see, the call to the service handling new users is mocked so its returning an OK response. If you check the file `AddUser.test.js` you can see a similar example but returning a negative response.

In order to execute these unitary tests we need to execute `npm test`. The tests are executed using jest. 

Note that code coverage is not updated for executing the tests. Only when we create a new release and fire all the actions involved with it, the coverage report will be sent to SonarCloud. You can check the unit-tests job in order to understand how this works:

```yml
unit-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm --prefix users/authservice ci
    - run: npm --prefix users/userservice ci
    - run: npm --prefix llmservice ci
    - run: npm --prefix gatewayservice ci
    - run: npm --prefix webapp ci
    - run: npm --prefix users/authservice test -- --coverage
    - run: npm --prefix users/userservice test -- --coverage
    - run: npm --prefix llmservice test -- --coverage
    - run: npm --prefix gatewayservice test -- --coverage
    - run: npm --prefix webapp test -- --coverage
    - name: Analyze with SonarQube
      uses: SonarSource/sonarqube-scan-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```


### E2E tests (`npm run test:e2e`)

E2E tests are maybe the most difficult part to integrate in our system. We have to test the system as a whole. The idea here is to deploy the system and make the tests using [jest-puppeteer](https://github.com/smooth-code/jest-puppeteer) (browser automatization) and [jest-cucumber](https://www.npmjs.com/package/jest-cucumber) (user stories). We will also be using [expect-puppeteer](https://www.npmjs.com/package/expect-puppeteer) to make easier the test writing. All the structure needed is under the `webapp/e2e` directory. These tests can be run locally using `npm run test:e2e` and they will be run also in GitHub Actions, just after the unitary tests. 

In this project, the E2E testing user stories are defined using Cucumber. Cucumber uses a language called Gherkin to define the user stories. You can find the example in the `features` directory. Then, the actual tests are in the folder `steps`. We are going to configure jest to execute only the tests of this directory (check the `jest.config.ts` file in the `e2e` directory). 

The E2E tests have two extra difficulties. The first one, we need a browser to perform the tests as if the user was using the application. For this matter, we use `jest-puppeteer` that will launch a Chromium instance for running the tests. The browser is started in the `beforeAll` function. Note that the browser is launched in a headless mode. This is necessary for the tests to run in the CI environment. If you want to debug the tests you can always turn this feature off. The second problem is that we need all our services at the same time to be able to run the tests. For achieving this, we are going to use the package `start-server-and-test`. This package, allows us to launch multiple servers and then run the tests. No need for any configuration. We can configure it straight in the `package.json` file:

```json
   "test:e2e": "start-server-and-test 'node e2e/test-environment-setup.js' http://localhost:8000/health prod 3000 \"cd e2e && jest\"",
```


The package accepts pairs of parameters (launch a server and an URL to check if it is running. It also accepts npm commands (for instance prod, for the webapp, that will run `npm run prod`). The last parameter of the task will be launching Jest to run the E2E tests.

### Load testing (Gatling)
This part will be carried out using [Gatling](https://gatling.io/). Gatling will simulate load in our system making petitions to the webapp.

In order to use Gatling for doing the load tests in our application we need to [download](https://docs.gatling.io/reference/install/oss/) it. Basically, the program has two parts, a [recorder](https://docs.gatling.io/tutorials/recorder/) to capture the actions that we want to test and a program to run this actions and get the results. Gatling will take care of capture all the response times in our requests and presenting them in quite useful graphics for its posterior analysis.

Once we have downloaded Gatling we need to start the [recorder](https://docs.gatling.io/tutorials/recorder/). This works as a proxy that intercepts all the actions that we make in our browser. That means that we have to configure our browser to use a proxy. We have to follow this steps:

1. Configure the recorder in **HTTP proxy mode**.
2. Configure the **HTTPs mode** to Certificate Authority.
3. Generate a **CA certificate** and key. For this, press the Generate CA button. You will have to choose a folder to generate the certificates. Two pem files will be generated.
4. Configure Firefox to use this **CA certificate** (Preferences>Certificates, import the generated certificate).
5. Configure Firefox to use a **proxy** (Preferences>Network configuration). The proxy will be localhost:8000.
6. Configure Firefox so it uses this proxy even if the call is to a local address. In order to do this, we need to set the property `network.proxy.allow_hijacking_localhost` to `true` in `about:config`. 

Once we have the recorder configured, and the application running (in Azure for instance), we can start recording our first test. We must specify a package and class name. This is just for test organization. Package will be a folder and Class name the name of the test. In my case I have used `GetUsersList` without package name. After pressing start the recorder will start capturing our actions in the browser. So here you should perform all the the actions that you want to record. In my case, I opened the main website and added one user. Once we stop recording the simulation will be stored under the `user-files/simulations` directory, written in [Scala](https://www.scala-lang.org/) language. I have copied the generated file under `webapp/loadtestexample` just in case you want to see how a test file in gatling looks like. Note that this simulation included a post petition to the restapi. Post data is stored under a different directory in the gattling installation directory (`user-files/resources`). 

We can modify our load test for instance to inject 2 users per second during 1 minute:
```scala
setUp(scn.injectOpen(constantUsersPerSec(2).during(60).randomized()).protocols(httpProtocol));
```
changing it in the scala file. Check [here](https://gatling.io/docs/gatling/reference/current/core/injection/) to see more options about generating load.
In order to execute the test we have to execute:

```bash
gatling.sh
```

In the console, we will get an overview of the results and in the results directory we will have the full report in web format.

It is important to note that we could also dockerize this load tests using this [image](https://hub.docker.com/r/denvazh/gatling). It is just a matter of telling the docker file where your gatling configuration and scala files are and the image will do the rest.

Note that we are handling all the setup for the auth and user microservices using the file `test-environment-setup.js`. This file has the code needed to run everything, including an in-memory Mongo database to be able to execute the tests.

