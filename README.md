# Bitcoin regtest

Aka [regtest mode][regtest-mode] is
an environment where you can easily issue new bitcoins perform transactions
etc.

This is extremely helpful to be used as mock to create integration tests for
your bitcoin application.

## Using the image

### Build and install image to your docker environment

```
docker build -t regtest-image
```

Or

```
./build.sh
```

#### From docker hub

```
docker pull alexlun/bitcoin-regtest
docker tag alexlun/bitcoin-regtest regtest-image
```

Or

```
./install.sh
```

### Running the container

```
docker -p 18332:18332 -d --name regtest regtest-image
```

Or

```
./run.sh
```

Since this all is about testing, it would be good to clean up to refresh
environment for subsequent tests:

```
docker stop regtest && docker rm regtest
```

Or

```
./stop.sh
```

This opearations could be also easily done using mupliple [docker
clients][docker-clients] availiable whithin your test suites.

### Connecting to the container

The address to connect to is `$DOCKER_HOST:18332`.
Credentials - login `rpcuser` password `rpcpassword`.
If you want to experiment with cli it's absolutely possible:
```
docker exec -it regtest bitcoin-cli -regtest generate 101
```

Or

```
./gen.sh
```

This operation will mine 101 block for you so you will be able to start
spending first block.

(c) 2015 Alexey Lunacharsky

[docker-clients]: https://docs.docker.com/reference/api/remote_api_client_libraries/
[regtest-mode]: https://bitcoin.org/en/developer-examples#regtest-mode
