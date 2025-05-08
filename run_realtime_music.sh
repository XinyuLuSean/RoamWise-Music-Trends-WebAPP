#!/bin/bash

# 激活 Python 虚拟环境
source ~/music-env/bin/activate

# 写入开始时间到日志
echo "$(date): Started real-time music fetch job" >> ~/realtime_log.txt

# 运行抓取脚本并记录标准输出和错误
python /Users/junyuanh/Desktop/Group23-Project/realtime_data_pipeline/fetch_realtime.py >> ~/realtime_log.txt 2>&1

# 写入结束时间到日志
echo "$(date): Completed real-time music fetch job" >> ~/realtime_log.txt
echo "---------------------------------------------" >> ~/realtime_log.txt

