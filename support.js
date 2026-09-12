/*
 * support.js — runtime mínimo para abrir un artboard .dc.html directamente en
 * el navegador (doble clic, sin servidor).
 *
 * El .dc.html normalmente lo pinta el canvas de Claude Design. Sin este archivo
 * el navegador no entiende `sc-if` ni `sc-for`, así que dibuja las siete
 * pantallas apiladas y deja los dos modales —que son `position: fixed`— encima
 * tapando todo, sin manera de cerrarlos.
 *
 * Esto interpreta lo justo para que la maqueta se pueda recorrer:
 *
 *   <helmet>                      mueve <link> y <style> al <head>
 *   <x-dc>                        raíz de la maqueta
 *   {{ valor }} · {{ obj.campo }} interpolación en texto y atributos
 *   <sc-if value="{{ x }}">       muestra si x es verdadero
 *   <sc-for list="{{ xs }}" as="n">  repite por cada elemento
 *   onClick / onChange / onKeyDown   handlers
 *   style-hover="..."             estilos al pasar el cursor
 *   dangerouslySetInnerHTML       inserta HTML crudo (los íconos SVG)
 *   DCLogic + renderVals()        la clase que devuelve los valores a pintar
 *
 * No es el runtime real ni pretende serlo: no hay diffing, cada cambio de
 * estado repinta el árbol completo (la maqueta es chica, se nota nada) y
 * después devuelve el foco y el cursor al campo donde estabas escribiendo.
 *
 * Los atributos `hint-*` son pistas para el editor del canvas; aquí se ignoran.
 */
(function () {
  "use strict";

  // Si el canvas ya trajo su propio runtime, no lo pisamos.
  if (window.DCLogic) return;

  var SVG_NS = "http://www.w3.org/2000/svg";
  var INTERP = /\{\{\s*([^}]+?)\s*\}\}/g;
  var ONLY_INTERP = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  // ---------------------------------------------------------------- valores

  // "n.label" -> scope.n.label. Solo rutas por punto: es todo lo que usa el
  // marcado, y así no hace falta evaluar texto arbitrario.
  function resolve(expr, scope) {
    expr = expr.trim();
    if (expr === "true") return true;
    if (expr === "false") return false;
    var parts = expr.split(".");
    var value = scope;
    for (var i = 0; i < parts.length; i++) {
      if (value == null) return undefined;
      value = value[parts[i].trim()];
    }
    return value;
  }

  // Si el atributo es exactamente una interpolación devolvemos el valor tal
  // cual (función, objeto, booleano). Si no, la sustitución es textual.
  function evaluate(text, scope) {
    var only = ONLY_INTERP.exec(text);
    if (only) return resolve(only[1], scope);
    return interpolate(text, scope);
  }

  function interpolate(text, scope) {
    return text.replace(INTERP, function (_, expr) {
      var value = resolve(expr, scope);
      return value == null ? "" : String(value);
    });
  }

  function parseStyle(css) {
    var out = {};
    css.split(";").forEach(function (rule) {
      var i = rule.indexOf(":");
      if (i < 0) return;
      var prop = rule.slice(0, i).trim();
      if (prop) out[prop] = rule.slice(i + 1).trim();
    });
    return out;
  }

  // ----------------------------------------------------------------- pintar

  function renderChildren(template, scope, parent) {
    var nodes = template.childNodes;
    for (var i = 0; i < nodes.length; i++) renderNode(nodes[i], scope, parent);
  }

  function renderNode(template, scope, parent) {
    if (template.nodeType === 3) {
      var text = interpolate(template.nodeValue, scope);
      if (text) parent.appendChild(document.createTextNode(text));
      return;
    }
    if (template.nodeType !== 1) return;

    var tag = template.localName;

    if (tag === "sc-if") {
      if (resolve(stripBraces(template.getAttribute("value")), scope)) {
        renderChildren(template, scope, parent);
      }
      return;
    }

    if (tag === "sc-for") {
      var list = resolve(stripBraces(template.getAttribute("list")), scope) || [];
      var alias = template.getAttribute("as");
      for (var i = 0; i < list.length; i++) {
        var inner = Object.create(scope);
        inner[alias] = list[i];
        inner.$index = i;
        renderChildren(template, inner, parent);
      }
      return;
    }

    parent.appendChild(renderElement(template, scope));
  }

  function stripBraces(text) {
    var only = ONLY_INTERP.exec(text || "");
    return only ? only[1] : text || "";
  }

  function renderElement(template, scope) {
    var el = document.createElementNS(template.namespaceURI, template.localName);
    var attrs = template.attributes;
    var rawHtml = null;

    for (var i = 0; i < attrs.length; i++) {
      var name = attrs[i].name;
      var raw = attrs[i].value;

      // Pistas del editor del canvas.
      if (name.indexOf("hint-") === 0) continue;

      // El parser del navegador baja los eventos a minúsculas y ya dejó un
      // handler en línea roto sobre la plantilla; aquí los volvemos a atar
      // como listeners de verdad sobre el nodo nuevo.
      if (name === "onclick") {
        bind(el, "click", evaluate(raw, scope));
        continue;
      }
      if (name === "onchange") {
        bind(el, "input", evaluate(raw, scope));
        continue;
      }
      if (name === "onkeydown") {
        bind(el, "keydown", evaluate(raw, scope));
        continue;
      }

      if (name === "dangerouslysetinnerhtml") {
        var payload = evaluate(raw, scope);
        rawHtml = payload && payload.__html;
        continue;
      }

      if (name === "style-hover") {
        hover(el, parseStyle(interpolate(raw, scope)));
        continue;
      }

      var value = interpolate(raw, scope);

      // Los campos controlados necesitan la propiedad, no solo el atributo.
      if (name === "value") {
        el.setAttribute("value", value);
        el.value = value;
        continue;
      }

      el.setAttribute(name, value);
    }

    if (rawHtml != null) {
      el.innerHTML = rawHtml;
      return el;
    }

    renderChildren(template, scope, el);
    return el;
  }

  function bind(el, type, handler) {
    if (typeof handler === "function") el.addEventListener(type, handler);
  }

  function hover(el, styles) {
    var base = el.getAttribute("style") || "";
    el.addEventListener("mouseenter", function () {
      for (var prop in styles) el.style.setProperty(prop, styles[prop]);
    });
    el.addEventListener("mouseleave", function () {
      el.setAttribute("style", base);
    });
  }

  // ------------------------------------------------- foco entre repintados

  function pathTo(node, root) {
    var path = [];
    while (node && node !== root) {
      var siblings = node.parentNode ? node.parentNode.childNodes : [];
      path.push(Array.prototype.indexOf.call(siblings, node));
      node = node.parentNode;
    }
    return node === root ? path.reverse() : null;
  }

  function nodeAt(root, path) {
    var node = root;
    for (var i = 0; i < path.length && node; i++) node = node.childNodes[path[i]];
    return node;
  }

  function captureFocus(root) {
    var active = document.activeElement;
    if (!active || !root.contains(active)) return null;
    var path = pathTo(active, root);
    if (!path) return null;
    var snapshot = { path: path };
    try {
      snapshot.start = active.selectionStart;
      snapshot.end = active.selectionEnd;
    } catch (e) {
      /* selectionStart no aplica a todos los campos */
    }
    return snapshot;
  }

  function restoreFocus(root, snapshot) {
    if (!snapshot) return;
    var node = nodeAt(root, snapshot.path);
    if (!node || !node.focus) return;
    node.focus();
    if (snapshot.start != null) {
      try {
        node.setSelectionRange(snapshot.start, snapshot.end);
      } catch (e) {
        /* ídem */
      }
    }
  }

  // ------------------------------------------------------------- DCLogic

  var pending = null;

  window.DCLogic = function DCLogic(props) {
    this.props = props || {};
  };

  window.DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === "function" ? patch(this.state) : patch;
    this.state = Object.assign({}, this.state, next);
    if (pending) pending();
  };

  // ---------------------------------------------------------------- arranque

  function defaultProps(scriptEl) {
    var props = {};
    var raw = scriptEl.getAttribute("data-props");
    if (raw) {
      try {
        var spec = JSON.parse(raw);
        for (var key in spec) {
          if (spec[key] && "default" in spec[key]) props[key] = spec[key]["default"];
        }
      } catch (e) {
        console.warn("[dc] data-props ilegible:", e);
      }
    }
    // Permite fijar una pantalla desde la barra de direcciones para demostrar:
    //   index.html?defaultTab=publicar
    var query = new URLSearchParams(location.search);
    query.forEach(function (value, key) {
      props[key] = value;
    });
    return props;
  }

  function boot() {
    var helmet = document.querySelector("helmet");
    if (helmet) {
      while (helmet.firstChild) document.head.appendChild(helmet.firstChild);
      helmet.parentNode.removeChild(helmet);
    }

    var root = document.querySelector("x-dc");
    var script = document.querySelector("script[data-dc-script]");
    if (!root || !script) {
      console.warn("[dc] falta <x-dc> o el script de la maqueta");
      return;
    }

    // El árbol original pasa a ser plantilla; el mount es lo que se ve.
    var template = document.createElement("div");
    while (root.firstChild) template.appendChild(root.firstChild);
    var mount = document.createElement("div");
    root.parentNode.replaceChild(mount, root);

    var Component;
    try {
      Component = new Function(
        "DCLogic",
        script.textContent + "\n;return Component;"
      )(window.DCLogic);
    } catch (e) {
      console.error("[dc] el script de la maqueta no compila:", e);
      return;
    }

    var instance = new Component(defaultProps(script));
    var queued = false;

    function draw() {
      var snapshot = captureFocus(mount);
      var next = document.createElement("div");
      try {
        renderChildren(template, instance.renderVals(), next);
      } catch (e) {
        console.error("[dc] error al pintar:", e);
        return;
      }
      mount.innerHTML = "";
      while (next.firstChild) mount.appendChild(next.firstChild);
      restoreFocus(mount, snapshot);
    }

    // Agrupa varios setState del mismo clic en un solo repintado.
    pending = function () {
      if (queued) return;
      queued = true;
      Promise.resolve().then(function () {
        queued = false;
        draw();
      });
    };

    draw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
