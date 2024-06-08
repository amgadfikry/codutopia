#!/bin/bash

sleep 10
echo "Init replica set"
mongo --host mongoDB1 <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongoDB1" },
    { _id: 1, host: "mongoDB2" },
    ]
  })
EOF

echo "Create replica successfuly"
