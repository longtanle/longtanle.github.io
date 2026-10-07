---
title: Federated learning: useful collaboration without centralising data
date: 2026-10-08
summary: An accessible introduction to federated learning, the problems it can solve, and the practical challenges hidden behind the simple idea of training without moving data.
tags: Federated Learning, Distributed AI, Privacy
slug: federated-learning-an-introduction
---

Modern machine-learning systems benefit from diverse data, but that data is often distributed across phones, hospitals, companies, sensors, or geographical regions. Moving everything into one central repository may be expensive, slow, restricted by policy, or simply unacceptable to the people and organisations that own it.

**Federated learning** offers a different model of collaboration. Instead of collecting raw data in one place, participants train locally and share model updates with a coordinating server. The server combines those updates into a new global model, which is then returned to participants for another training round.

The appealing summary is often "move the model, not the data." That is a useful starting point, but a reliable federated system requires much more than changing where training runs.

## How a basic round works

A typical federated-learning round has four steps:

1. A server selects a group of available participants and sends them the current model.
2. Each participant trains the model using its local data.
3. Participants send model updates, rather than raw training records, to the server.
4. The server aggregates the updates and produces the next global model.

The best-known baseline is **Federated Averaging**, which combines local updates according to the amount of data held by each participant. Repeating this process can produce a useful shared model while the original records remain local.

This architecture can support cross-device settings involving many intermittently connected devices, or cross-silo settings involving a smaller number of organisations such as hospitals and research institutions.

## Why distribution changes the learning problem

Centralised training usually assumes that data can be shuffled into reasonably representative batches and processed by reliable infrastructure. Federated learning weakens both assumptions.

Participants rarely hold identically distributed data. One hospital may serve a different population from another. A person's phone reflects their own language and behaviour. An industrial sensor may operate under environmental conditions that do not appear elsewhere. This **statistical heterogeneity** can make local updates disagree and can slow or destabilise global training.

The computing environment is also heterogeneous. Participants may have different processors, memory limits, network connections, energy budgets, and availability. Some will finish quickly, some will be slow, and others will disconnect before a round completes.

The central research question is therefore not only how to aggregate models. It is how to learn fairly and efficiently when the data, devices, and objectives are all different.

## Privacy is improved, not guaranteed

Keeping raw data local reduces unnecessary movement and creates a useful privacy boundary. It does not automatically make a system private.

Model updates can reveal information under certain attacks. A deployment may therefore combine federated learning with techniques such as secure aggregation, differential privacy, access controls, and careful logging. Each protection has a cost: stronger privacy may reduce model utility, increase communication, or make failures harder to diagnose.

Privacy should be treated as a system property with a clearly defined threat model, not as a label attached to the training algorithm.

## Communication is part of the algorithm

In distributed environments, sending an update may be more expensive than computing it. A practical design must consider:

- how often participants communicate;
- how many participants join each round;
- whether updates can be compressed or sparsified;
- how the system responds to slow or unavailable participants; and
- whether local computation can reduce the number of global rounds.

These choices connect statistical performance with infrastructure cost. A model that reaches slightly higher accuracy but requires ten times as much communication may be the wrong model for an edge deployment.

## One global model may not fit everyone

Participants can have genuinely different goals. Personalisation methods address this by combining shared knowledge with local adaptation. Some approaches fine-tune a global model locally, while others learn shared representations and participant-specific components together.

Personalisation changes how success should be measured. Average global accuracy is no longer enough. We may also care about worst-participant performance, fairness across groups, calibration, robustness, and the cost of adaptation.

## When federated learning is a good fit

Federated learning is most compelling when collaboration offers clear value and centralising raw data is undesirable. Examples include mobile services, health research, financial institutions, industrial networks, and fleets of connected devices.

It is not automatically the best choice for every distributed dataset. If data can be shared safely and cheaply, a centralised pipeline may be simpler to operate. Federated learning introduces coordination, monitoring, security, and reproducibility challenges that should be justified by the application.

## A practical way to evaluate a federated system

I find it useful to ask five questions:

1. **Utility:** Does collaboration improve outcomes for the participants who need it?
2. **Heterogeneity:** How does the method behave across different data distributions and device capabilities?
3. **Efficiency:** What are the communication, compute, energy, and latency costs?
4. **Trust:** What can the server and participants observe, and what failures or attacks are considered?
5. **Operations:** Can the system be monitored, reproduced, updated, and recovered in practice?

Federated learning is ultimately a systems problem as much as a machine-learning problem. Its value comes from making useful collaboration possible under real constraints - and from being honest about the trade-offs required to do so.
