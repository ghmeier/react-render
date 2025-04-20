const path = require("node:path");
const assert = require("chai").assert;
const reactRender = require("..");
const Component = require("../lib/Component");

const HelloComponentPath = path.join(__dirname, "test_components", "Hello.js");
const ErrorThrowingComponentPath = path.join(
  __dirname,
  "test_components",
  "ErrorThrowingComponent.js"
);

describe("reactRender", () => {
  beforeEach(() => {
    reactRender._components.clear();
  });
  it("is a function", () => {
    assert.isFunction(reactRender);
  });
  it("can render a component to static markup", (done) => {
    reactRender(
      {
        path: HelloComponentPath,
        toStaticMarkup: true,
        props: {
          name: "World",
        },
      },
      (err, output) => {
        assert.isNull(err);
        assert.equal(output, "<div>Hello World</div>");
        done();
      }
    );
  });
  it("can render a component to a string", (done) => {
    reactRender(
      {
        path: HelloComponentPath,
        props: {
          name: "World",
        },
      },
      (err, output) => {
        assert.isNull(err);
        assert.include(output, "<div");
        assert.include(output, ">Hello ");
        assert.include(output, ">World");
        assert.include(output, "</div>");
        done();
      }
    );
  });
  it("can render a component without props", (done) => {
    reactRender(
      {
        path: HelloComponentPath,
        toStaticMarkup: true,
      },
      (err, output) => {
        assert.isNull(err);
        assert.equal(output, "<div>Hello </div>");
        done();
      }
    );
  });
  it("can parse props which are provided in a JSON serialized form", (done) => {
    reactRender(
      {
        path: HelloComponentPath,
        toStaticMarkup: true,
        serializedProps: '{"name": "World"}',
      },
      (err, output) => {
        assert.isNull(err);
        assert.equal(output, "<div>Hello World</div>");
        done();
      }
    );
  });
  it("can require a component specified by a path and render it", (done) => {
    reactRender(
      {
        path: path.join(__dirname, "test_components", "Hello"),
        toStaticMarkup: true,
        props: {
          name: "World",
        },
      },
      (err, output) => {
        assert.isNull(err);
        assert.equal(output, "<div>Hello World</div>");
        done();
      }
    );
  });
  it("should return an error if neither `component` and `path` have been defined", (done) => {
    reactRender(
      {
        toStaticMarkup: true,
        props: {
          name: "World",
        },
      },
      (err, output) => {
        assert.instanceOf(err, Error);
        assert.include(err.stack, "Component missing `path` property");
        assert.isUndefined(output);
        done();
      }
    );
  });
  it("should create `Component` instances when called", (done) => {
    assert.isArray(reactRender._components._cache);
    assert.equal(reactRender._components._cache.length, 0);

    reactRender(
      {
        path: HelloComponentPath,
      },
      () => {
        assert.equal(reactRender._components._cache.length, 1);
        assert.instanceOf(reactRender._components._cache[0], Component);
        assert.equal(
          reactRender._components._cache[0].component,
          require(HelloComponentPath)
        );
        done();
      }
    );
  });
  it("should reuse Component instances when called", () => {
    assert.isArray(reactRender._components._cache);
    assert.equal(reactRender._components._cache.length, 0);

    reactRender({ component: HelloComponentPath }, () => {});
    assert.equal(reactRender._components._cache.length, 1);
    assert.instanceOf(reactRender._components._cache[0], Component);
    assert.equal(
      reactRender._components._cache[0].component,
      HelloComponentPath
    );

    reactRender({ path: "foo" }, () => {});
    assert.equal(reactRender._components._cache.length, 2);
    assert.instanceOf(reactRender._components._cache[1], Component);
    assert.equal(reactRender._components._cache[1].opts.path, "foo");

    reactRender({ path: "foo" }, () => {});
    assert.equal(reactRender._components._cache.length, 2);
    assert.instanceOf(reactRender._components._cache[1], Component);
    assert.equal(reactRender._components._cache[1].opts.path, "foo");

    reactRender({ path: "foo", props: { bar: 1 } }, () => {});
    assert.equal(reactRender._components._cache.length, 2);
    assert.instanceOf(reactRender._components._cache[1], Component);
    assert.equal(reactRender._components._cache[1].opts.path, "foo");

    reactRender({ path: "bar", serializedProps: { bar: 1 } }, () => {});
    assert.equal(reactRender._components._cache.length, 3);
    assert.instanceOf(reactRender._components._cache[2], Component);
    assert.equal(reactRender._components._cache[2].opts.path, "bar");

    reactRender({ path: "foo", serializedProps: '{"bar": 1}' }, () => {});
    assert.equal(reactRender._components._cache.length, 3);
    assert.instanceOf(reactRender._components._cache[1], Component);
    assert.equal(reactRender._components._cache[1].opts.path, "foo");

    reactRender({ path: "bar", serializedProps: '{"bar": 1}' }, () => {});
    assert.equal(reactRender._components._cache.length, 3);
    assert.instanceOf(reactRender._components._cache[2], Component);
    assert.equal(reactRender._components._cache[2].opts.path, "bar");
  });
  it("passes up errors thrown during a component's rendering", (done) => {
    reactRender(
      {
        path: ErrorThrowingComponentPath,
      },
      (err, output) => {
        assert.instanceOf(err, Error);
        assert.include(err.stack, "Error from inside ErrorThrowingComponent");
        assert.include(
          err.stack,
          path.join(__dirname, "test_components", "ErrorThrowingComponent.js")
        );
        assert.isUndefined(output);
        done();
      }
    );
  });
});
