const path = require("node:path");
const assert = require("chai").assert;
const Component = require("../lib/Component");

const Hello = path.join(__dirname, "test_components", "Hello.js");
const ErrorThrowingComponent = path.join(
  __dirname,
  "test_components",
  "ErrorThrowingComponent.js"
);
const SyntaxErrorComponent = path.join(
  __dirname,
  "test_components",
  "SyntaxErrorComponent.js"
);

describe("Component", () => {
  it("is a function", () => {
    assert.isFunction(Component);
  });
  it("can require a component specified by a path", (done) => {
    const component = new Component({
      path: Hello,
    });

    component.getComponent((err, component) => {
      assert.isNull(err);
      assert.strictEqual(component, require(Hello));
      done();
    });
  });
  it("can render a component to static markup", (done) => {
    const component = new Component({
      path: Hello,
    });

    component.renderToStaticMarkup(null, (err, markup) => {
      assert.isNull(err);
      assert.equal(markup, "<div>Hello </div>");
      done();
    });
  });
  it("can render a component to a string", (done) => {
    const component = new Component({
      path: Hello,
    });

    component.renderToString(null, (err, markup) => {
      assert.isNull(err);
      assert.include(markup, "<div");
      assert.include(markup, ">Hello </div>");
      done();
    });
  });
  it("can render a component to static markup with props", (done) => {
    const component = new Component({
      path: Hello,
    });

    component.renderToStaticMarkup(
      {
        name: "World",
      },
      (err, markup) => {
        assert.isNull(err);
        assert.equal(markup, "<div>Hello World</div>");
        done();
      }
    );
  });
  it("can render a component to a string with props", (done) => {
    const component = new Component({
      path: Hello,
    });

    component.renderToString(
      {
        name: "World",
      },
      (err, markup) => {
        assert.isNull(err);
        assert.include(markup, "<div");
        assert.include(markup, ">Hello ");
        assert.include(markup, ">World");
        assert.include(markup, "</div>");
        done();
      }
    );
  });
  it("should return an error if neither `component` and `path` have been defined", (done) => {
    const component = new Component({});

    component.getComponent((err, component) => {
      assert.instanceOf(err, Error);
      assert.include(err.stack, "Component missing `path` property");
      assert.isUndefined(component);
      done();
    });
  });
  it("passes up errors thrown during a component's rendering", (done) => {
    const component = new Component({
      path: ErrorThrowingComponent,
    });

    component.renderToString(null, (err, output) => {
      assert.instanceOf(err, Error);
      assert.include(err.stack, "Error from inside ErrorThrowingComponent");
      assert.include(err.stack, ErrorThrowingComponent);
      assert.isUndefined(output);
      done();
    });
  });
  it("provides a SyntaxError if a component contains syntax errors", (done) => {
    const component = new Component({
      path: SyntaxErrorComponent,
    });

    component.getComponent((err, component) => {
      assert.instanceOf(err, SyntaxError);
      assert.isUndefined(component);
      done();
    });
  });
});
