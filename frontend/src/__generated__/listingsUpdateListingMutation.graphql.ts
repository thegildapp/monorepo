/**
 * @generated SignedSource<<bb0860403f62688b37375fd867e7a6fb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ListingStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
export type UpdateListingInput = {
  city?: string | null | undefined;
  description?: string | null | undefined;
  imageVariants?: ReadonlyArray<ImageVariantsInput> | null | undefined;
  images?: ReadonlyArray<string> | null | undefined;
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
  price?: number | null | undefined;
  state?: string | null | undefined;
  title?: string | null | undefined;
};
export type ImageVariantsInput = {
  card: string;
  full: string;
  thumbnail: string;
};
export type listingsUpdateListingMutation$variables = {
  id: string;
  input: UpdateListingInput;
};
export type listingsUpdateListingMutation$data = {
  readonly updateListing: {
    readonly city: string | null | undefined;
    readonly createdAt: string;
    readonly description: string;
    readonly id: string;
    readonly imageVariants: ReadonlyArray<{
      readonly card: string;
      readonly full: string;
      readonly thumbnail: string;
    }> | null | undefined;
    readonly images: ReadonlyArray<string>;
    readonly price: number;
    readonly state: string | null | undefined;
    readonly status: ListingStatus;
    readonly title: string;
    readonly updatedAt: string;
  };
};
export type listingsUpdateListingMutation = {
  response: listingsUpdateListingMutation$data;
  variables: listingsUpdateListingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Listing",
    "kind": "LinkedField",
    "name": "updateListing",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "title",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "description",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "price",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "images",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageVariants",
        "kind": "LinkedField",
        "name": "imageVariants",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "thumbnail",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "card",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "full",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "city",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "state",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "status",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createdAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "updatedAt",
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
    "name": "listingsUpdateListingMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "listingsUpdateListingMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "572fc3501e0af9b873270ef683f2c8c8",
    "id": null,
    "metadata": {},
    "name": "listingsUpdateListingMutation",
    "operationKind": "mutation",
    "text": "mutation listingsUpdateListingMutation(\n  $id: ID!\n  $input: UpdateListingInput!\n) {\n  updateListing(id: $id, input: $input) {\n    id\n    title\n    description\n    price\n    images\n    imageVariants {\n      thumbnail\n      card\n      full\n    }\n    city\n    state\n    status\n    createdAt\n    updatedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "77910455bdf3a036795d9253ed95f336";

export default node;
