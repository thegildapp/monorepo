/**
 * @generated SignedSource<<b6ecadff972fb9d8a576b8bee35d0d79>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type viewTrackingTrackListingViewMutation$variables = {
  listingId: string;
};
export type viewTrackingTrackListingViewMutation$data = {
  readonly trackListingView: {
    readonly success: boolean;
    readonly viewCount: number;
  };
};
export type viewTrackingTrackListingViewMutation = {
  response: viewTrackingTrackListingViewMutation$data;
  variables: viewTrackingTrackListingViewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "listingId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "listingId",
        "variableName": "listingId"
      }
    ],
    "concreteType": "TrackViewPayload",
    "kind": "LinkedField",
    "name": "trackListingView",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "viewCount",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "viewTrackingTrackListingViewMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "viewTrackingTrackListingViewMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8ead1801359dd72c53054927e1ac54db",
    "id": null,
    "metadata": {},
    "name": "viewTrackingTrackListingViewMutation",
    "operationKind": "mutation",
    "text": "mutation viewTrackingTrackListingViewMutation(\n  $listingId: ID!\n) {\n  trackListingView(listingId: $listingId) {\n    success\n    viewCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "da80c003c898609f247d1fd0b8c4777f";

export default node;
