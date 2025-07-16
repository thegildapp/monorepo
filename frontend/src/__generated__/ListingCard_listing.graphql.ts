/**
 * @generated SignedSource<<db899b98182884c60bc296cd8a511762>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ListingCard_listing$data = {
  readonly city: string | null | undefined;
  readonly createdAt: string;
  readonly id: string;
  readonly images: ReadonlyArray<string>;
  readonly price: number;
  readonly state: string | null | undefined;
  readonly title: string;
  readonly " $fragmentType": "ListingCard_listing";
};
export type ListingCard_listing$key = {
  readonly " $data"?: ListingCard_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"ListingCard_listing">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListingCard_listing",
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
      "name": "createdAt",
      "storageKey": null
    }
  ],
  "type": "Listing",
  "abstractKey": null
};

(node as any).hash = "0a1d855e80bb2d301d66ff96ca7ae36a";

export default node;
