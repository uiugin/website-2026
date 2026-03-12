import { LitElement, html, css } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';

class MySettingsDashboard extends UmbElementMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      padding: var(--uui-size-space-6);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-space-6);
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--uui-size-space-3) 0;
    }

    p {
      color: var(--uui-color-text-alt);
      margin: 0;
    }

    .card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      padding: var(--uui-size-space-6);
      max-width: 500px;
    }
  `;

  #notificationContext;
  #loading = false;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (context) => {
      this.#notificationContext = context;
    });
  }

  async #handleClick() {
    this.#loading = true;
    this.requestUpdate();

    try {
      const response = await fetch('https://localhost:44392/api/test/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ triggered: true }),
      });

      if (response.ok) {
        this.#notificationContext?.peek('positive', {
          data: { headline: 'Success', message: 'Action completed successfully!' },
        });
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      this.#notificationContext?.peek('danger', {
        data: { headline: 'Error', message: error.message },
      });
    } finally {
      this.#loading = false;
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="dashboard-header">
        <h2>Rebuild Static Site</h2>
      </div>

      <div class="card">
        <p style="margin-bottom: var(--uui-size-space-4)">
          Click here to rebuild your site.
        </p>
        <uui-button
          look="primary"
          color="positive"
          label="Run Action"
          ?disabled=${this.#loading}
          @click=${this.#handleClick}>
          ${this.#loading ? 'Running...' : 'Run Action'}
        </uui-button>
      </div>
    `;
  }
}

customElements.define('my-settings-dashboard', MySettingsDashboard);
export default MySettingsDashboard;