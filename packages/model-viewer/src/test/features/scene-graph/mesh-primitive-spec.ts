/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {MeshStandardMaterial} from 'three';

import {$primitives} from '../../../features/scene-graph/model.js';
import {ModelViewerElement} from '../../../model-viewer.js';
import {waitForEvent} from '../../../utilities.js';
import {assetPath} from '../../helpers.js';



const expect = chai.expect;

const LANTERN_GLB_PATH =
    assetPath('models/glTF-Sample-Models/2.0/Lantern/glTF-Binary/Lantern.glb');
const BRAIN_STEM_GLB_PATH = assetPath(
    'models/glTF-Sample-Models/2.0/BrainStem/glTF-Binary/BrainStem.glb');
const SHEEN_CHAIR_GLB_PATH = assetPath(
    'models/glTF-Sample-Models/2.0/SheenChair/glTF-Binary/SheenChair.glb');

suite('scene-graph/model/mesh-primitives', () => {
  const loadModel = async (path: string) => {
    const element = new ModelViewerElement();
    element.src = path;
    document.body.insertBefore(element, document.body.firstChild);
    await waitForEvent(element, 'load');
    return element.model;
  };

  suite('Static Primitive', () => {
    test('Primitive count matches glTF file', async () => {
      const model = await loadModel(LANTERN_GLB_PATH);
      expect(model![$primitives].length).to.equal(3);
    });

    test('Should have variant info', async () => {
      const model = await loadModel(SHEEN_CHAIR_GLB_PATH);
      let hasVariantInfoCount = 0;
      for (const primitive of model![$primitives]) {
        if (primitive.variantInfo != null) {
          hasVariantInfoCount++;
        }
      }
      expect(hasVariantInfoCount).equals(2);
    });

    test('Should not have variant info', async () => {
      const model = await loadModel(SHEEN_CHAIR_GLB_PATH);
      let hasNoVariantInfoCount = 0;
      for (const primitive of model![$primitives]) {
        if (primitive.variantInfo === undefined) {
          hasNoVariantInfoCount++;
        }
      }
      expect(hasNoVariantInfoCount).equals(2);
    });


    test('Switching to incorrect variant name', async () => {
      const model = await loadModel(SHEEN_CHAIR_GLB_PATH);
      const material =
          await model![$primitives][0].enableVariant('Does not exist');
      expect(material).to.be.null;
    });

    test('Switching to current variant', async () => {
      const model = await loadModel(SHEEN_CHAIR_GLB_PATH);
      const material = await model![$primitives][0].enableVariant(
                           'Mango Velvet') as MeshStandardMaterial;
      expect(material).to.not.be.null;
      expect(material!.name).to.equal('fabric Mystere Mango Velvet');
    });

    test('Switching to other variant name', async () => {
      const model = await loadModel(SHEEN_CHAIR_GLB_PATH);
      const material = await model![$primitives][0].enableVariant(
                           'Peacock Velvet') as MeshStandardMaterial;
      expect(material).to.not.be.null;
      expect(material!.name).to.equal('fabric Mystere Peacock Velvet');
    });

    test('Switching to back variant name', async () => {
      const model = await loadModel(SHEEN_CHAIR_GLB_PATH);
      let material = await model![$primitives][0].enableVariant(
                         'Peacock Velvet') as MeshStandardMaterial;
      material = await model![$primitives][0].enableVariant('Mango Velvet') as
          MeshStandardMaterial;

      expect(material).to.not.be.null;
      expect(material!.name).to.equal('fabric Mystere Mango Velvet');
    });
  });

  suite('Skinned Primitive', () => {
    test('Primitive count matches glTF file', async () => {
      const model = await loadModel(BRAIN_STEM_GLB_PATH);
      expect(model![$primitives].length).to.equal(59);
    });
  });
});
