# Keyprr


## How to use

Go to the [Keyprr website](https://keyprr.netlify.app/) to store your secrets

Each secret stored will return a hash key, `make sure you save this`

In your application's index.html (or whichever html pages are consuming these secrets)
put the code snippet at the end of the `body` tag `BEFORE` your own JS.

```
    <script>
      var keyHash = "your-api-key-here";
      var apikey;
      fetch(
        `https://ljgvrb40q2.execute-api.us-west-2.amazonaws.com/dev/keyprr/${keyHash}`
      )
        .then((res) => res.json())
        .then(({ data }) => (apikey = data));
    </script>
```

You will then be able to access the variable `apikey` in your own script.