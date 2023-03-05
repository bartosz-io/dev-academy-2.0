---
title: Angular Signals
contributor: Łukasz Fajger
avatar: lukasz-fajger.jpg
description: This is description of the post added in meta description tag.
tags: [angular]
id: angular-signals
date: 2023-03-05 15:57:37
---
<!-- {% image_fw 1.78 banner.png "ALT text of the article" %}-->

## Table of Contents
<!-- toc -->

## Angular Reactivity with Signals

The Angular team has been working for some time now to introduce signals as a **reactive primitive in Angular**.


They [announced](https://github.com/angular/angular/discussions/49090) that their goal is:
> to embrace fine-grained reactivity in the core of the framework.

This means that a lot of changes are coming to the core framework and change detection. These will be fundamental changes that will make zone.js optional. Say&nbsp;what? Optional zone.js?

{% img "say-what.png" "Alt title for the image" "lazy" %}

Yes, that's right. You won't need zone.js if you use signals. I dare say it looks like Angular wants to get rid of zone.js in the future. But we don't have to fear anything, because for the moment we will have backward compatibility with zone.js all the time.
> We want to change the underlying change detection system for Angular.

To get started and see how the signal works, you can install the `16.0.0-next.0` version of angular. As this is a prototype, it is not worth using it in production for the time being.


## Header 2

Content...

### Header 2.1

Content 2.1

### Header 2.2

Content 2.2

etc.

...

## Summary

Here is the summary of the post. Add at least few sentences.

---
Useful examples of markdown usage inside article. Remove this content later.

### Image
{% img "your-image.jpg" "Alt title for the image" "lazy" %}

### Code highlighting
You can add any language you want, e.g. html, css, js, typescript, bash etc.
```typescript
@Component({
  selector: 'categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

}
```

### Lists

#### Type 1
First way:
* expose methods for the components in which we:
    * delegate logic execution to the core layer,
    * decide about data synchronization strategy (optimistic vs. pessimistic),
* expose streams of state for the components:
    * pick one or more streams of UI state (and combine them if necessary),
        * cache data from external API.

Second way:

- expose methods for the components in which we:
    - delegate logic execution to the core layer,
    - decide about data synchronization strategy (optimistic vs. pessimistic),
- expose streams of state for the components:
    - pick one or more streams of UI state (and combine them if necessary),
    - cache data from external API.

#### Type 2
1. expose methods for the components in which we:
    1. delegate logic execution to the core layer,
    2. decide about data synchronization strategy (optimistic vs. pessimistic),
2. expose streams of state for the components:
    1. pick one or more streams of UI state (and combine them if necessary),
    2. cache data from external API.


### Blockquote
> #### My title
> My paragraph
> - first point
> - second point

Check more on: https://www.markdownguide.org/basic-syntax/