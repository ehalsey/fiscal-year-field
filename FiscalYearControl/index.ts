import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class FiscalYearControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _value: string | null;
    private _lastValidValue: string;
    private _notifyOutputChanged: () => void;
    private _container: HTMLDivElement;
    private _inputElement: HTMLInputElement;
    private _transitionMonth: number;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;

        this._transitionMonth = context.parameters.transitionMonth.raw !== null ? context.parameters.transitionMonth.raw : 9;
        if (this._transitionMonth < 0 || this._transitionMonth > 11) this._transitionMonth = 9;

        this._inputElement = document.createElement("input");
        this._inputElement.setAttribute("type", "text");
        this._inputElement.setAttribute("maxlength", "4");
        this._inputElement.setAttribute("placeholder", "e.g., 2025");
        this._inputElement.classList.add("fiscal-year-input");
        this._container.appendChild(this._inputElement);

        this._value = context.parameters.yearValue.raw || this.getDefaultFiscalYear();
        this._lastValidValue = this._value;
        this._inputElement.value = this._value;

        this._inputElement.addEventListener("change", this.onChange.bind(this));
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._transitionMonth = context.parameters.transitionMonth.raw !== null ? context.parameters.transitionMonth.raw : 9;
        if (this._transitionMonth < 0 || this._transitionMonth > 11) this._transitionMonth = 9;

        const newValue = context.parameters.yearValue.raw;
        if (newValue !== this._value) {
            this._value = newValue || this.getDefaultFiscalYear();
            this._lastValidValue = this._value;
            this._inputElement.value = this._value;
        }
    }

    public getOutputs(): IOutputs {
        return {
            yearValue: this._value
        };
    }

    public destroy(): void {
        this._inputElement.removeEventListener("change", this.onChange);
    }

    private onChange(event: Event): void {
        const input = (event.target as HTMLInputElement).value.trim();
        if (this.isValidYear(input)) {
            this._value = input;
            this._lastValidValue = input;
            this._notifyOutputChanged();
        } else {
            this._inputElement.value = this._lastValidValue;
        }
    }

    private isValidYear(year: string): boolean {
        const yearNumber = parseInt(year, 10);
        return year.length === 4 && !isNaN(yearNumber) && yearNumber >= 1900 && yearNumber <= 2100;
    }

    private getDefaultFiscalYear(): string {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const fiscalYear = currentMonth >= this._transitionMonth ? currentYear + 1 : currentYear;
        return fiscalYear.toString();
    }
}