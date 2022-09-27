# Measure the performance of any Android app 🚀

- 🙅 No installation required, supports even production app
- ✨ Generates beautiful web report ([like this Flatlist/Flashlist comparison](https://bamlab.github.io/android-performance-profiler/report/complex-list/s10/report.html))
- 💻 Via E2E test, Flipper plugin or CLI

<img width="596" alt="image" src="https://user-images.githubusercontent.com/4534323/187192078-402c306e-4d29-465c-bdfa-f278e7f0b927.png">

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN npx doctoc README.md TO UPDATE -->

- [Getting started with the automated profiler](#getting-started-with-the-automated-profiler)
  - [Main usage](#main-usage)
  - [Advanced usage](#advanced-usage)
  - [Using other e2e frameworks](#using-other-e2e-frameworks)
  - [Comparing](#comparing)
  - [Exploiting measures](#exploiting-measures)
  - [Running in CI](#running-in-ci)
    - [AWS Device Farm](#aws-device-farm)
- [Flipper Plugin](#flipper-plugin)
- [CLI](#cli)
  - [Via Custom script](#via-custom-script)
- [Contributing](#contributing)
  - [web-reporter](#web-reporter)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started with the automated profiler

### Main usage

TODO: providing a sample app here would be nice (either a production one like Twitter, or a sample APK)

1. Install the profiler `yarn add --dev @perf-profiler/e2e`

2. Create a TS script including a performance test, for instance `start.ts`

```ts
import { AppiumDriver } from "@bam.tech/appium-helper";
import { TestCase, measurePerformance } from "@perf-profiler/e2e";

const runTest = async () => {
  const driver = await AppiumDriver.create({
    // `npx @perf-profiler/profiler getCurrentApp` will display info for the current app
    appPackage: "com.example",
    appActivity: "com.example.MainActivity",
  });

  const testCase: TestCase = {
    beforeTest: async () => {
      driver.stopApp();
    },
    run: async () => {
      // run is where measuring will happen
      driver.startApp();
      await driver.findElementByText("KILL JS");
    },
    // Duration is optional, but helps in getting consistent measures.
    // Measures will be taken for this duration, regardless of test duration
    duration: 10000,
  };

  const { writeResults } = await measurePerformance(bundleId, testCase);
  writeResults();
};

runTest();
```

3. Run `npx appium` in one tab
4. Run `npx ts-node start.ts` in a separate tab
5. Open the JSON file generated in the web profiler:

```sh
npx @perf-profiler/web-reporter results.json
```

### Advanced usage

TODO: check example folder, add several examples there

### Using other e2e frameworks

Any e2e framework running tests via JS/TS is supported.

### Comparing

If you have several JSON files of measures, you can open the comparison view with:

```sh
npx @perf-profiler/web-reporter results1.json results2.json results3.json
```

### Exploiting measures

Measures are also directly exploitable from the `mesurePerformance` function.
You can install the `@perf-profiler/reporter` package to get access to reporting functions for averaging...

```ts
import {
  getAverageCpuUsage,
  getAverageFPSUsage,
  getAverageRAMUsage,
} from "@perf-profiler/reporter";

...

const { measures } = await measurePerformance(bundleId, testCase);

const cpuPerTestIteration = measures.map((measure) =>
  getAverageCpuUsage(measure.measures)
);
```

### Running in CI

To run in CI, you'll need the CI to be connected to an Android device. An emulator running on the CI will likely be too slow, so it's best to be connected to a device farm cloud. The profiler needs full `adb` access, so only few device cloud are compatible:

Our choice is **AWS Device Farm** but some other options should work as well (though they haven't been tested):

- Saucelabs with Entreprise plan and [Virtual USB](https://docs.saucelabs.com/mobile-apps/features/virtual-usb/)
- [Genymotion Cloud](https://www.genymotion.com/pricing/) (using emulators will not accurately reproduce the performance of a real device)

#### AWS Device Farm

We've added a neat tool to seamlessly run your tests on AWS Device Farm and get the measures back:

```
export AWS_ACCESS_KEY_ID="ADD YOUR AWS KEY ID HERE" AWS_SECRET_ACCESS_KEY="ADD YOUR AWS SECRET HERE"

# Run from your root folder, containing `node_modules`
npx @perf-profiler/aws-device-farm runTest \
  --apkPath app-release.apk \
  --deviceName "A10s" \
  --testCommand "yarn jest appium"
```

## Flipper Plugin

https://user-images.githubusercontent.com/4534323/164205504-e07f4a93-25c1-4c14-82f3-5854ae11af8e.mp4

To install, simply search for `android-performance-profiler` in the Flipper marketplace![image](https://user-images.githubusercontent.com/4534323/165071805-bf553b14-42f5-441b-8771-139bfb613941.png)

## CLI

You can profile directly in CLI with:

```
npx @perf-profiler/profiler profile --fps --ram --threadNames "(mqt_js)" "UI Thread"
```

You can also use a custom script:

### Via Custom script

For instance:

```ts
import {
  detectCurrentAppBundleId,
  getAverageCpuUsage,
  getPidId,
  Measure,
  pollPerformanceMeasures,
} from "@perf-profiler/profiler";

const { bundleId } = detectCurrentAppBundleId();
const pid = getPidId(bundleId);

const measures: Measure[] = [];

const polling = pollPerformanceMeasures(pid, (measure) => {
  measures.push(measure);
  console.log(`JS Thread CPU Usage: ${measure.perName["(mqt_js)"]}%`);
});

setTimeout(() => {
  polling.stop();
  const averageCpuUsage = getAverageCpuUsage(measures);
  console.log(`Average CPU Usage: ${averageCpuUsage}%`);
}, 10000);
```

## Contributing

### web-reporter

At the root of the repo:

```
yarn
yarn tsc --build --w
```

and run in another terminal:

```
yarn workspace @perf-profiler/web-reporter start
```

Then in `packages/web-reporter/src/App.tsx`, uncomment the lines to add your own measures:

```ts
// Uncomment with when locally testing
// eslint-disable-next-line @typescript-eslint/no-var-requires
testCaseResults = [require("../measures.json")];
```

You should now be able to open [the local server](http://localhost:1234/)

Run `yarn jest Plugin -u` after modifications.
