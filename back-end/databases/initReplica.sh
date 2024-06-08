#!/bin/bash

sleep 10
echo "Init replica set"
mongo --host 172.29.0.5:27017 <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "172.29.0.5:27017" },
    { _id: 1, host: "172.29.0.6:27017" },
    ]
  })
EOF

echo "Create replica successfuly"
