FROM ubuntu:14.04

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 8842ce5e && \
    echo "deb http://ppa.launchpad.net/bitcoin/bitcoin/ubuntu trusty main" > /etc/apt/sources.list.d/bitcoin.list

RUN apt-get update && \
    apt-get install -y bitcoind && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV HOME /bitcoin
WORKDIR /bitcoin
RUN mkdir user0 user1 user2 user3 user4 user5 user6 user7 user8 user9

VOLUME ["/bitcoin"]

COPY run_servers /usr/local/bin/run_servers
COPY bitcoin /bitcoin/.bitcoin
COPY users.json /bitcoin/users.json

EXPOSE 18444 2000 2001 2002 2003 2004 2005 2006 2007 2008 2009

CMD ["run_servers"]
