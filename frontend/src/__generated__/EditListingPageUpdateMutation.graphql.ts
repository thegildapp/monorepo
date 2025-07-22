/**
 * @generated SignedSource<<530ca67dc3b6b121890071fd1741328a>>
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
export type EditListingPageUpdateMutation$variables = {
  id: string;
  input: UpdateListingInput;
};
export type EditListingPageUpdateMutation$data = {
  readonly updateListing: {
    readonly city: string | null | undefined;
    readonly description: string;
    readonly id: string;
    readonly images: ReadonlyArray<string>;
    readonly price: number;
    readonly state: string | null | undefined;
    readonly status: ListingStatus;
    readonly title: string;
    readonly updatedAt: string;
  };
};
export type EditListingPageUpdateMutation = {
  response: EditListingPageUpdateMutation$data;
  variables: EditListingPageUpdateMutation$variables;
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
    "name": "EditListingPageUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditListingPageUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1468e058e3167143c5fb6f65460b9bab",
    "id": null,
    "metadata": {},
    "name": "EditListingPageUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation EditListingPageUpdateMutation(\n  $id: ID!\n  $input: UpdateListingInput!\n) {\n  updateListing(id: $id, input: $input) {\n    id\n    title\n    description\n    price\n    images\n    city\n    state\n    status\n    updatedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "f3254da936ca3736392c0c174e078ba1";

export default node;
