#!/usr/bin/env python3
"""Extrae /joint_states de un rosbag2 (sqlite3) a un JSON liviano para el
visor 3D del portafolio. Requiere ROS2 (rosbag2_py + rclpy) en el entorno.

Uso:
    source /opt/ros/jazzy/setup.bash
    python3 extract_trajectory.py <bag_dir> <output.json> [--hz 20] [--start S] [--duration S]
"""
import argparse
import json
import sys

import rclpy
from rclpy.serialization import deserialize_message
from rosidl_runtime_py.utilities import get_message
import rosbag2_py


def read_joint_states(bag_dir, hz, start, duration):
    storage_options = rosbag2_py.StorageOptions(uri=bag_dir, storage_id="sqlite3")
    converter_options = rosbag2_py.ConverterOptions(
        input_serialization_format="cdr", output_serialization_format="cdr"
    )
    reader = rosbag2_py.SequentialReader()
    reader.open(storage_options, converter_options)

    topic_types = reader.get_all_topics_and_types()
    type_map = {t.name: t.type for t in topic_types}
    if "/joint_states" not in type_map:
        sys.exit("No hay topic /joint_states en este bag")
    msg_type = get_message(type_map["/joint_states"])

    storage_filter = rosbag2_py.StorageFilter(topics=["/joint_states"])
    reader.set_filter(storage_filter)

    min_gap_ns = int(1e9 / hz) if hz else 0
    t0 = None
    last_kept_ns = None
    frames = []
    joint_names = None

    while reader.has_next():
        topic, data, t_ns = reader.read_next()
        msg = deserialize_message(data, msg_type)

        if t0 is None:
            t0 = t_ns
        rel_s = (t_ns - t0) / 1e9

        if start is not None and rel_s < start:
            continue
        if duration is not None and rel_s > start + duration:
            break

        if last_kept_ns is not None and (t_ns - last_kept_ns) < min_gap_ns:
            continue
        last_kept_ns = t_ns

        if joint_names is None:
            joint_names = list(msg.name)

        # Asume mismo orden de joints en todos los mensajes (cierto en este stack).
        positions = [round(p, 4) for p in msg.position]
        frames.append([round(rel_s - start if start else rel_s, 3), positions])

    return joint_names, frames


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("bag_dir")
    ap.add_argument("output")
    ap.add_argument("--hz", type=float, default=20.0)
    ap.add_argument("--start", type=float, default=None, help="segundos desde el inicio del bag")
    ap.add_argument("--duration", type=float, default=None, help="segundos a extraer")
    args = ap.parse_args()

    rclpy.init(args=[])
    joint_names, frames = read_joint_states(args.bag_dir, args.hz, args.start, args.duration)
    rclpy.shutdown()

    out = {"joints": joint_names, "frames": frames}
    with open(args.output, "w") as f:
        json.dump(out, f, separators=(",", ":"))

    print(f"{len(frames)} frames, {len(joint_names)} joints -> {args.output}")


if __name__ == "__main__":
    main()
