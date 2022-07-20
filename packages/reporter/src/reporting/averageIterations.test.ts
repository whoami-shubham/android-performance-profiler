import { averageHighCpuUsage, averageIterations } from "./averageIterations";
import { TestCaseIterationResult } from "@perf-profiler/types";

const ITERATION_1: TestCaseIterationResult = {
  measures: [
    {
      cpu: {
        perCore: {},
        perName: {
          A: 50,
          B: 30,
        },
      },
      ram: 100,
      time: 500,
    },
    {
      cpu: {
        perCore: {},
        perName: {
          A: 100,
          B: 100,
        },
      },
      ram: 100,
      time: 1000,
    },
  ],
  time: 0,
  gfxInfo: {
    frameCount: 0,
    time: 0,
    renderTime: 0,
    histogram: [],
  },
};

const ITERATION_2: TestCaseIterationResult = {
  measures: [
    {
      cpu: {
        perCore: {},
        perName: {
          B: 70,
          C: 100,
        },
      },
      ram: 300,
      time: 500,
    },
    {
      cpu: {
        perCore: {},
        perName: {
          B: 70,
          C: 100,
        },
      },
      ram: 300,
      time: 1000,
    },
  ],
  time: 0,
  gfxInfo: {
    frameCount: 0,
    time: 0,
    renderTime: 0,
    histogram: [],
  },
};

it("average measures", () => {
  expect(averageIterations([ITERATION_1, ITERATION_2])).toEqual({
    measures: [
      {
        cpu: {
          perCore: {},
          perName: {
            A: 25,
            B: 50,
            C: 50,
          },
        },
        ram: 200,
        time: 500,
      },
      {
        cpu: {
          perCore: {},
          perName: {
            A: 50,
            B: 85,
            C: 50,
          },
        },
        ram: 200,
        time: 500,
      },
    ],
    time: 0,
    gfxInfo: {
      frameCount: 0,
      time: 0,
      renderTime: 0,
      histogram: [],
    },
  });
});

it("averages high CPU usage", () => {
  expect(averageHighCpuUsage([ITERATION_1, ITERATION_2])).toEqual({
    A: 250,
    B: 250,
    C: 500,
  });
});
