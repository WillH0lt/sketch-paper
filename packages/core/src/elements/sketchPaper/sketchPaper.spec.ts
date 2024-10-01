import { afterEach, describe, it } from '@jest/globals';
import type { LitElement } from 'lit';
import { html, render } from 'lit';
import './sketchPaper.js';

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
    const SUT = await fixture(html`<sketch-paper></sketch-paper>`);

    expect(SUT.shadowRoot?.textContent).toStrictEqual(expect.stringContaining('Hello world!'));
  });

  // it('can say hi to another', async () => {
  //   const SUT = await fixture(html`<sketch-paper who="Fernando"></sketch-paper>`);

  //   expect(SUT.shadowRoot?.textContent).toStrictEqual(expect.stringContaining('Hello Fernando!'));
  // });
});
