import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync,readdirSync,statSync} from "node:fs";
import {join} from "node:path";

const projectRoot="/mnt/sdcard/Download/CodeEmpire/CodeEmpire_V0_1_Phase4_Complete_AssetReady";
const androidDir=join(projectRoot,"android");

test("android platform folder ada",()=>{
  assert.ok(existsSync(androidDir),"folder android/ harus ada");
  assert.ok(existsSync(join(androidDir,"app")),"folder app/ harus ada");
  assert.ok(existsSync(join(androidDir,"gradlew")),"gradlew harus ada");
  assert.ok(existsSync(join(androidDir,"build.gradle")),"build.gradle harus ada");
  assert.ok(existsSync(join(androidDir,"settings.gradle")),"settings.gradle harus ada");
});

test("AndroidManifest.xml ada & berisi screenOrientation=landscape",()=>{
  const manifestPath=join(androidDir,"app/src/main/AndroidManifest.xml");
  assert.ok(existsSync(manifestPath));
  const content=readFileSync(manifestPath,"utf8");
  assert.match(content,/android:screenOrientation="landscape"/);
  assert.match(content,/android\.permission\.INTERNET/);
  assert.match(content,/android\.permission\.VIBRATE/);
});

test("capacitor.config.json ada dan webDir=dist",()=>{
  const configPath=join(projectRoot,"capacitor.config.json");
  assert.ok(existsSync(configPath));
  const config=JSON.parse(readFileSync(configPath,"utf8"));
  assert.equal(config.appId,"com.codeempire.app");
  assert.equal(config.appName,"Code Empire");
  assert.equal(config.webDir,"dist");
  assert.ok(config.plugins&&config.plugins.SplashScreen);
  assert.equal(config.plugins.SplashScreen.backgroundColor,"#0b1019");
});

test("android/app/src/main/assets/public/ berisi hasil build",()=>{
  const publicDir=join(androidDir,"app/src/main/assets/public");
  assert.ok(existsSync(publicDir));
  assert.ok(existsSync(join(publicDir,"index.html")));
  assert.ok(existsSync(join(publicDir,"js")));
  assert.ok(existsSync(join(publicDir,"css")));
  assert.ok(existsSync(join(publicDir,"assets")));
});

test("asset personality/tier/ui tercopy ke android",()=>{
  const base=join(androidDir,"app/src/main/assets/public/assets");
  assert.ok(existsSync(join(base,"personality","personality-creative.svg")));
  assert.ok(existsSync(join(base,"tier","tier-freelancer.svg")));
  assert.ok(existsSync(join(base,"ui","ui-quest.svg")));
  const personalityCount=readdirSync(join(base,"personality")).length;
  const tierCount=readdirSync(join(base,"tier")).length;
  const uiCount=readdirSync(join(base,"ui")).length;
  assert.ok(personalityCount>=8,"minimal 8 personality");
  assert.ok(tierCount>=5,"minimal 5 tier");
  assert.ok(uiCount>=18,"minimal 18 ui");
});

test("styles.xml berisi fullscreen & dark theme",()=>{
  const stylesPath=join(androidDir,"app/src/main/res/values/styles.xml");
  assert.ok(existsSync(stylesPath));
  const content=readFileSync(stylesPath,"utf8");
  assert.match(content,/@color\/colorPrimary/);
  assert.match(content,/@color\/status_bar/);
  assert.match(content,/Fullscreen/);
  assert.match(content,/statusBarColor/);
  assert.match(content,/windowBackground/);
});

test("styles.xml referensi ke colors.xml yang berisi #0b1019",()=>{
  const colorsPath=join(androidDir,"app/src/main/res/values/colors.xml");
  const stylesPath=join(androidDir,"app/src/main/res/values/styles.xml");
  assert.ok(existsSync(colorsPath));
  assert.ok(existsSync(stylesPath));
  const colors=readFileSync(colorsPath,"utf8");
  const styles=readFileSync(stylesPath,"utf8");
  const hexMatch=colors.match(/#0b1019/i);
  assert.ok(hexMatch,"colors.xml harus memuat #0b1019");
  assert.ok(styles.includes("@color/window_background"),"styles.xml harus refer ke @color/window_background");
});

test("colors.xml berisi warna brand",()=>{
  const colorsPath=join(androidDir,"app/src/main/res/values/colors.xml");
  assert.ok(existsSync(colorsPath));
  const content=readFileSync(colorsPath,"utf8");
  assert.match(content,/#0b1019/);
  assert.match(content,/#4b7bff/);
});

test("strings.xml app_name = Code Empire",()=>{
  const stringsPath=join(androidDir,"app/src/main/res/values/strings.xml");
  assert.ok(existsSync(stringsPath));
  const content=readFileSync(stringsPath,"utf8");
  assert.match(content,/<string name="app_name">Code Empire<\/string>/);
});

test("android/app/build.gradle ada & applicationId benar",()=>{
  const gradlePath=join(androidDir,"app/build.gradle");
  assert.ok(existsSync(gradlePath));
  const content=readFileSync(gradlePath,"utf8");
  assert.match(content,/com\.codeempire\.app/);
});

test("dist sebagai sumber webDir",()=>{
  const distExists=existsSync(join(projectRoot,"dist"));
  const distIndex=existsSync(join(projectRoot,"dist/index.html"));
  assert.ok(distExists&&distIndex);
});

test("package.json berisi scripts build & cap",()=>{
  const pkg=JSON.parse(readFileSync(join(projectRoot,"package.json"),"utf8"));
  assert.ok(pkg.scripts.test);
  assert.ok(pkg.scripts.build);
  assert.ok(pkg.scripts["build:android"]);
  assert.ok(pkg.devDependencies["@capacitor/core"]);
  assert.ok(pkg.devDependencies["@capacitor/cli"]);
  assert.ok(pkg.devDependencies["@capacitor/android"]);
});
