## Description

Server side application of Gold Rush Event

## Installation

```bash
$ npm install
```

Create .env file in the root directory of the project.(Optional)

Add the environment variables.

```
# DATABASE CONFIGS
DATABASE_URI='mongodb://127.0.0.1:27017/'
DATABASE_NAME='gold-rush'
DATABASE_USER=
DATABASE_PASS=

# APP CONFIGS
PORT=3001
EVENT_START_CRON_TIME='*/1 * * * *'
EVENT_DURATION=2
EVENT_END_CRON_TIME='* * * * * *'
WHALE_LIMIT=2
DOLPHIN_LIMIT=40
FISH_LIMIT=150
REWARD_AMOUNT=200

# AUTH CONFIGS
JWT_KEY='4zZQBSPVERKLTrUFm4ncIsO3MkO10HdHfDTDs1Vd5X8gd8VKB1UekWCmIJONLshn4ZUut8juQthqX5tKVNktZs4jnJhmqKoZWKHUswO8U8QE6MSLPxIitHiCx/JCIdrARoW7hTt19KRhHo5JdmNVOwcVe6WQ/YqKcjccVpMM0O8yiA036szJULh02Knty/Y1ezB6cB4oEo8T0VJLoshK0K+N6exVznXewClm3h8U6ldiMCmezHMrLsSRW18266GKY8BFb3Y8ckKJaOTo+AQV+eK6kXAGh0Lx5rR7oS8aw46HUUqxSPyDrf6oSdEo0/MWw5jQBx6O3eyJEAHlmgIrPQ=='
JWT_REFRESH_SECRET='dZM9YRan+K9gOAVVNMOitgDjsDhZqvFkMtYB2N5azymDyuqUkc1cbSt4CEspX01kA0y4B8V/CdPZgGsrk2mlcw+K65BA+4ndoK2+GDKzFmec+SKKlnDl8NaXp81nmRrvqSDz+wzuqOXqGN29ajnzELfn17YlwwQPltsNMrS/sqX7MiaEtNh+Moi58fiRLebRlAPADvXEooF72UOMVUntDAYzx8QJeRQ3HZswDXDxf/yEu0gYcj7Ycj0imkkLSaWkhurTE5kghw+YULEUAyeo40Zq01Z/bteFZozMi+7MX+Z5bCkSXghySm9wWElVZH1uWgHySbqhiW8foLBZSLcsTA=='
JWT_EXPIRATION='1h'
JWT_REFRESH_EXPIRATION='7d'

#REDIS CONFIGS
REDIS_HOST='127.0.0.1'
REDIS_PORT=6379
```

Note: Usually .env file is hidden or encrypted for security reasons.

To create JWT secret run

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
