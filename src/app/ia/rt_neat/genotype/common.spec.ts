import { NodeGene } from "./node";
import { NodeType } from "../phenotype/node";
import { ConnectGene } from "./connect";

export interface ExpectedConnection {
    innovation: number;
    inNode: NodeGene;
    outNode: NodeGene;
    isEnabled: boolean;
    recurrent: boolean;
    weight: number;
    testValue: boolean;
}

export interface ExpectedNode {
    identifier: number;
    type: NodeType;
    layer: number;
    inputs?: ConnectGene[];
    outputs?: ConnectGene[];
}

export function checkConnection(connect: ConnectGene, conf: ExpectedConnection) {
    expect(connect.innovation).toBe(conf.innovation);
    expect(connect.inputNode.identifier).toBe(conf.inNode.identifier);
    expect(connect.outputNode.identifier).toBe(conf.outNode.identifier);
    expect(connect.isEnabled).toBe(conf.isEnabled);
    expect(connect.reccurent).toBe(conf.recurrent);

    if (conf.testValue) {
        expect(connect.weight).toBe(conf.weight);
    } else {
        expect(isNaN(connect.weight)).toBeFalsy();
    }
}

export function checkNode(node: NodeGene, conf: ExpectedNode) {
    expect(node.identifier).toBe(conf.identifier);
    expect(node.nodeType).toBe(conf.type);
    expect(node.layer).toBe(node.layer);

    if (conf.inputs) {
        const inputsIds = node.inputs.map(i => i.innovation);
        const expectedInputsIds = conf.inputs.map(i => i.innovation);
        for (const id of expectedInputsIds) {
            expect(inputsIds).toContain(id);
        }
        expect(inputsIds.length).toBe(conf.inputs.length);
    }

    if (conf.outputs) {
        const outputsIds = node.outputs.map(i => i.innovation);
        const expectedOutputsIds = conf.outputs.map(i => i.innovation);
        for (const id of expectedOutputsIds) {
            expect(outputsIds).toContain(id);
        }
        expect(outputsIds.length).toBe(conf.outputs.length);
    }
}