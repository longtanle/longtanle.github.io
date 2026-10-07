---
title: Hardware-software co-design for efficient AI
date: 2026-10-06
summary: An introduction to designing models, runtimes, and computing hardware together instead of optimising each layer in isolation.
tags: Co-design, AI Hardware, Efficient Computing
slug: hardware-software-co-design-an-introduction
---

Machine-learning efficiency is often discussed as if it were a property of the model alone: fewer parameters, fewer operations, or a smaller file. In a deployed system, performance emerges from the interaction between the algorithm, numerical representation, compiler, runtime, memory hierarchy, and physical hardware.

**Hardware-software co-design** treats those layers as connected design choices. Instead of building a model first and asking hardware to execute it efficiently later, co-design considers the target platform while the model and system are still being developed.

This perspective is especially valuable for edge AI, where latency, energy, memory, and cost are tightly constrained.

## Why operation counts are not enough

Two neural networks with similar numbers of multiply-accumulate operations can behave very differently on the same processor. One may use regular, well-supported operations with high data reuse. The other may require irregular memory access, frequent format conversion, or small operations that leave compute units underused.

In many systems, moving data costs more time and energy than performing arithmetic on it. This makes memory behaviour central to performance. Cache size, on-chip buffers, bandwidth, tensor layout, and the opportunity to reuse intermediate values can matter as much as the nominal compute capability.

Co-design therefore asks not only "How many operations does this model require?" but also "How will these operations and their data move through this particular system?"

## The layers that meet in co-design

A useful co-design process connects several layers.

### Model architecture

The choice of layers, tensor shapes, activation functions, sparsity patterns, and attention mechanisms determines the workload presented to the system. Regular structures are generally easier to accelerate, while dynamic or irregular computation may offer algorithmic benefits but create implementation challenges.

### Numerical representation

Lower-precision formats can reduce storage, memory traffic, and compute cost. Quantisation may use 8-bit integers, even lower precision, or mixed precision across different parts of a model. The important question is where reduced precision is safe and how the hardware supports it.

### Compiler and runtime

Compilers transform a model graph into executable kernels. They may fuse operations, schedule loops, choose memory layouts, and target specialised instructions. A theoretically efficient accelerator can still perform poorly if the software stack cannot map models to it effectively.

### Hardware architecture

The hardware determines available parallelism, memory capacity, bandwidth, supported data types, and energy characteristics. CPUs, GPUs, neural accelerators, and FPGAs offer different balances of programmability and specialisation.

## FPGAs as a co-design platform

Field-programmable gate arrays are interesting for research because their data paths and memory structures can be configured for a workload. Designers can explore custom parallelism, streaming pipelines, specialised precision, and direct interfaces to sensors.

This flexibility can support low-latency and energy-efficient inference, particularly when the workload is stable and the design can exploit regular data flow. The trade-off is development complexity. Hardware description, verification, timing closure, resource constraints, and toolchain behaviour become part of the machine-learning engineering process.

FPGAs are not universally better than GPUs or dedicated accelerators. Their value depends on workload shape, production volume, latency requirements, power budget, and the need to update the design.

## A simple co-design example

Imagine an anomaly-detection model for a networked sensor gateway. A purely model-centric approach might select the architecture with the highest validation score. A co-design approach would evaluate several connected questions:

1. Can the input be processed as a stream without storing a large window in external memory?
2. Which layers dominate latency and memory traffic?
3. Can weights and activations use lower precision without harming detection performance?
4. Does the target device efficiently support the chosen operations?
5. Can preprocessing and inference share buffers or be fused into one pipeline?
6. How will the system be updated when traffic patterns change?

The final design may accept a very small reduction in benchmark accuracy in exchange for substantially lower latency, predictable timing, or the ability to run within the available power budget. Whether that is the right trade depends on the application's objectives.

## Measure on the complete system

Co-design requires measurements that cross abstraction boundaries. Useful metrics include:

- task accuracy, robustness, and calibration;
- end-to-end latency rather than isolated kernel time;
- throughput at realistic batch sizes;
- memory footprint and off-chip traffic;
- energy per inference;
- hardware utilisation;
- compilation and deployment complexity; and
- flexibility for future model updates.

These measurements should be taken under representative conditions. Large batches may make a device look efficient even when the real application processes one sample at a time. A fast accelerator kernel may have little effect if preprocessing or data transfer dominates total latency.

## Co-design as a research method

Hardware-software co-design is not limited to building custom chips. It is a way of reasoning about the entire computational path. The same mindset applies when choosing a model for a mobile processor, adapting an algorithm to a GPU, optimising a distributed training pipeline, or mapping inference to an FPGA.

The central lesson is that efficiency cannot be added reliably at the end. Model quality, numerical precision, data movement, software support, and hardware capability should be evaluated together. When those layers are aligned, systems can become not only faster, but also more predictable, energy-efficient, and practical to deploy.
