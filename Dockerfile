FROM kylemanna/bitcoind

COPY btc_oneshot /usr/local/bin/btc_oneshot
COPY btc_init /usr/local/bin/btc_init

EXPOSE 18332 18444
CMD ["btc_oneshot", "-regtest"]
