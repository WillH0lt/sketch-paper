import { afterEach, describe, it } from '@jest/globals';
import type { LitElement } from 'lit';
import { html, render } from 'lit';
import './sketchyDrawCanvas.js';

const fixture = async (value: unknown): Promise<Element> => {
  const wrapper = document.createElement('div');
  wrapper.id = 'wrapper';
  render(value, wrapper);
  document.body.appendChild(wrapper);
  const litElem = document.querySelector('#wrapper')?.firstElementChild as LitElement;
  await litElem.updateComplete;

  return litElem;
};

const cleanup = (): void => {
  document.querySelector('#wrapper')?.remove();
};

describe('sketch paper', () => {
  afterEach(() => {
    cleanup();
  });

  it('emits zoom events', async () => {
    const SUT = await fixture(html`<sketchy-draw-canvas></sketchy-draw-canvas>`);

    expect(SUT.shadowRoot?.textContent).toStrictEqual(expect.stringContaining('Hello world!'));
  });

  // it('can say hi to another', async () => {
  //   const SUT = await fixture(html`<sketchy-draw-canvas who="Fernando"></sketchy-draw-canvas>`);

  //   expect(SUT.shadowRoot?.textContent).toStrictEqual(expect.stringContaining('Hello Fernando!'));
  // });
});
