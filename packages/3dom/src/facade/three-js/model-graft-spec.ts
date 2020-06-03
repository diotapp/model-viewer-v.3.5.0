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

import {Object3D} from 'three/src/core/Object3D.js';

import {createFakeThreeGLTF} from '../../test-helpers.js';

import {CorrelatedSceneGraph} from './correlated-scene-graph.js';
import {ModelGraft} from './model-graft.js';
import {ThreeDOMElement} from './three-dom-element.js';

suite('facade/three-js/model-graft', () => {
  suite('ModelGraft', () => {
    suite('when an element is configured with it', () => {
      test('can query that element by internal ID', () => {
        const graft = new ModelGraft(
            '', CorrelatedSceneGraph.from(createFakeThreeGLTF()));
        const object3D = new Object3D();
        const element = new ThreeDOMElement(graft, {}, new Set([object3D]));

        expect(graft.getElementByInternalId(element.internalID))
            .to.be.equal(element);
      });
    });
  });
});
