# ![RealWorld Example App](assets/logo.png)

> ### React/Liaison codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

### [Demo](https://react-liaison-realworld-example-app.liaison.dev/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with [React](https://reactjs.org/) and [Liaison](https://liaison.dev/) including CRUD operations, authentication, routing, pagination, and more.

# How it works

## General architecture

Both the frontend and the backend use Liaison [Liaison](https://liaison.dev/), so there is no web API in between. The frontend communicate directly with the backend.

## Hosting

- The frontend is statically hosted in AWS S3 + CloudFront.
- The backend is exposed via a single function hosted in AWS Lambda.
- The database is hosted in a MongoDB Atlas cluster (free tier).

# Getting started

First, you need to install [Run](https://run.tools/):

```
curl https://install.run.tools | bash
```

> Note that [Run](https://run.tools/) is not required to build an application with [Liaison](https://liaison.dev/). I use Run to manage my development environment, but since it is still at a very early stage, I would rather recommend to use more established tools such as [Webpack](https://webpack.js.org/), [Parcel](https://parceljs.org/), etc.

Then, from the root of this repo, invoke the following command to install the dependencies:

```
run . @install
```

Finally, start the app with:

```
run . @start
```

The app should be available at <http://localhost:13577/>.

# To do

- Implement a test suite
- Replace Run with Parcel + Serverless framework
