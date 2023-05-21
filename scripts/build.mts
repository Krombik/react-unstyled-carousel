import { build } from 'tsup';
import ts from 'typescript';
import fs from 'fs/promises';
import { FILES_TO_COPY, Folder } from './constants.mjs';
import {
  addNestedPackagesJson,
  getMainPackageJson,
  handleChild,
} from './utils.mjs';

const run = async (outDir: string) => {
  await fs.rm(`${outDir}/${Folder.CHUNKS}`, { recursive: true, force: true });

  await build({
    outDir,
    minify: false,
    entry: [
      'src/index.ts',
      `src/${Folder.COMPONENTS}/*/*.(ts|tsx)`,
      `src/${Folder.HOOKS}/*/*.ts`,
      `src/${Folder.MODULES}/*/*.ts`,
      `src/${Folder.TIMING_FUNCTIONS}/*.ts`,
    ],
    splitting: true,
    sourcemap: true,
    clean: false,
    target: 'es2020',
    treeshake: { preset: 'smallest' },
    dts: false,
    format: ['cjs', 'esm'],
    platform: 'browser',
    external: ['react'],
  });

  if (
    ts
      .createProgram(['src/index.ts'], {
        emitDeclarationOnly: true,
        declaration: true,
        stripInternal: true,
        strictNullChecks: true,
        outDir,
        jsx: ts.JsxEmit.React,
      })
      .emit().emitSkipped
  ) {
    throw new Error('TypeScript compilation failed');
  }

  const children = await fs.readdir(outDir);

  const chunksDir = `${outDir}/${Folder.CHUNKS}`;

  await fs.mkdir(chunksDir);

  for (let i = 0; i < children.length; i++) {
    const file = children[i];

    const path = `${outDir}/${file}`;

    if (file.startsWith('chunk-')) {
      await fs.rename(path, `${chunksDir}/${file}`);
    } else {
      await handleChild(path);
    }
  }

  await addNestedPackagesJson(`${outDir}/${Folder.COMPONENTS}`);
  await addNestedPackagesJson(`${outDir}/${Folder.HOOKS}`);
  await addNestedPackagesJson(`${outDir}/${Folder.MODULES}`);
  await addNestedPackagesJson(`${outDir}/${Folder.TIMING_FUNCTIONS}`, true);

  await fs.writeFile(`${outDir}/package.json`, await getMainPackageJson());

  for (let i = 0; i < FILES_TO_COPY.length; i++) {
    const fileName = FILES_TO_COPY[i];

    await fs.copyFile(fileName, `${outDir}/${fileName}`);
  }
};

run('build');
