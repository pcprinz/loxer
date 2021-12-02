# Items
A common use case for the console is, to inspect objects / variables that are processed dynamically during runtime. There is no comparison to debugging an application, because inspecting the code on-time preserves the asynchronous behavior. Naturally many developers will probably just create a console log and set the item to inspect as the second parameter to print it's contents to the console. This case can be improved by using the `item` and `itemOptions` parameters of any of Loxers logging methods.

But first let's consider the following example:

### Example
There is a shopping app, that lets user buy articles on a store. The app is capable of restoring a shopping session, that a user did not complete the last time. Therefore the developer already integrated Loxer for logging the behavior of the processes for this specific use case. The output looks as follows:

##### Output of the dataflow of a malfunctioning shopping app
![no_item](/assets/docs_images/item/no_item.png)
<!-- ![no_item](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/item/no_item.png) -->

As one can see, the process of restoring the previous order payment failed, because the restored payment could not be parsed. The error that is thrown is successfully catched and logged with 
```typescript
Loxer.of(lox).error('failed to restore last payment: unable to parse payment!');
```
At this point it would be advisable to log the potentially faulty object as an `item`, since the information in the error message does not say why the parsing failed. Let's consider the object is created as `payment: any`. To compare the output with the `console`, let's first see what `console.log ('payment:', payment);` would output:

##### Output of an object logged as the second parameter of a console logging method
![console](/assets/docs_images/item/console.png)
<!-- ![console](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/item/console.png) -->

This artificial object looks fine on the first sight, but on closer inspection it becomes apparent that not the entire content of the object is shown. The `dealers` have been shortened to `[Object]`. Now let's see what Loxer will print to the output. To do this, we add the item `payment` to the existing error log method:
```typescript
Loxer.of(lox).error('failed to restore last payment: unable to parse payment!', payment);
```

##### Output of an object logged as the second parameter of a *Loxer logging* method
![full_item](/assets/docs_images/item/full_item.png)
<!-- ![full_item](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/item/full_item.png) -->

As you can see, the `item` is seamlessly integrated into the box layout of the existing logs. There are also some other peculiarities:

- the content of the `dealer` is now fully displayed (there is no depth limit)
- indent indicator lines are displayed in order to be able to recognize the nesting of the objects better
  
A closer look could reveal that the error is probably in the `isPrivate` attribute of the `dealer` object. But first we want to find out how we can set the depth limit for displaying objects. To do this, in addition to the `item`, we also use` itemOptions` in the log method:
```typescript
Loxer.of(lox).error('failed to restore last payment: unable to parse payment!', payment, {depth: 1});
```

##### Output of an object with option `depth: 1`
![depth1_item](/assets/docs_images/item/depth1_item.png)
<!-- ![depth1_item](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/item/depth1_item.png) -->

Similar to the `console`, arrays and objects are also grouped together here. In addition, however, information about the length of the content is given. The `console` seems to be limited to a depth of 3 in my tests, while Loxer's items are displayed without limitation in the default case. In the case of objects with deeply nested large arrays, however, restricting the depth can have a beneficial effect on readability.

There is, however, another possibility to restrict the search area in large objects. For this, `itemOptions` provides the option `keys: string []`, to which a list of keys (of the corresponding object) can be passed. The item is then filtered according to these keys, which makes it possible to display and examine large lists with large objects that are confusing. 

Let's do this for the `isPrivate` key of our `payment` item. Additionally we set the `dealerId` to find the erroneous data:
```typescript
Loxer.of(lox).error('failed to restore last payment: unable to parse payment!', payment, {
  keys: ['isPrivate', 'dealerId'],
});
```

##### Filtered output of an object
![filtered_item](/assets/docs_images/item/filtered_item.png)
<!-- ![filtered_item](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/item/filtered_item.png) -->

All irrelevant keys from objects are omitted and only those that are relevant, or which are on the path from the item to relevant keys, are displayed. Every object for which keys have been left out is supplemented with information about the number of left out entries. The keys are also highlighted.

# Implementation and Impact on performance
Of course, the dynamic processing of large objects requires resources and time during runtime. For this reason, it is generally not recommended to log large objects in production mode.
The processing of the item and its options, which are transferred with any logging method, only takes place in the output stream. Therefore the performance impact highly depends on "what you do with the item" at the output stream. The shown output is built-in to the default output streams, but can easily be copied. 

To get the output like in the default `devLog` and `devError` streams, the helper class `Item` can be used:
```typescript
Item.of(errorLox).prettify(true, {
  depth: this._moduleTextSlice + errorLox.box.length,
  color: errorLox.color,
})
```

`Item` has 1 static method `of(lox: Lox)` which takes any Lox (`OutputLox` / `ErrorLox`) and returns the chainable method `prettify(...)`.
`prettify()` receives a `boolean` as the first parameter for the decision whether the output is colored (with ANSI code) or not. The second (optional) parameter is an object for the configuration of the surrounding box. This gets a vertical `depth` and a `color`. The function then returns a string (with multiple line breaks), that displays the item.