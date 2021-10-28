# Background job queue - Local development setup

This is implemented to run the concept allocations in the background and makes use of the bee-queue npm package.
[bee-queue on gtihub](https://github.com/bee-queue/bee-queue)

### Add redis to your docker compose

```
  redis:
    image: "redis"
    command: redis-server --requirepass Salmagundi
    ports:
     - "6379:6379"
    environment:
     - REDIS_REPLICATION_MODE=master
```

### Add redis settings to your .env file

	ENABLE_CONCEPT_INDELING=1
	REDIS_HOST=127.0.0.1
	REDIS_PORT=6379
	REDIS_PASSWORD=Salmagundi

### start at least one worker process

	export $(cat .env) && npm run concept