/**
 * WSDL del web service SOAP de MiniMarket.
 *
 * Se incrusta como string (en vez de un archivo .wsdl suelto) para que quede
 * compilado dentro de `dist/` sin necesidad de copiar assets. SoapUI consume
 * este contrato desde:  http://localhost:3001/soap/minimarket?wsdl
 */
export const TNS = 'http://minimarket.unmsm.edu.pe/pos';

export const MINIMARKET_WSDL = `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions
    xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:tns="${TNS}"
    targetNamespace="${TNS}"
    name="MiniMarketService">

  <wsdl:types>
    <xsd:schema targetNamespace="${TNS}" elementFormDefault="qualified">

      <xsd:complexType name="Producto">
        <xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
          <xsd:element name="nombre" type="xsd:string"/>
          <xsd:element name="precio" type="xsd:decimal"/>
          <xsd:element name="stock" type="xsd:int"/>
          <xsd:element name="categoria" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>

      <xsd:element name="ListarProductosRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="categoria" type="xsd:string" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ListarProductosResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="producto" type="tns:Producto" minOccurs="0" maxOccurs="unbounded"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="ObtenerProductoRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="id" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ObtenerProductoResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="encontrado" type="xsd:boolean"/>
            <xsd:element name="producto" type="tns:Producto" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="CalcularIgvRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="subtotal" type="xsd:decimal"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="CalcularIgvResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="subtotal" type="xsd:decimal"/>
            <xsd:element name="igv" type="xsd:decimal"/>
            <xsd:element name="total" type="xsd:decimal"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

      <xsd:element name="ConsultarStockRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="productoId" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ConsultarStockResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="productoId" type="xsd:int"/>
            <xsd:element name="nombre" type="xsd:string"/>
            <xsd:element name="stock" type="xsd:int"/>
            <xsd:element name="disponible" type="xsd:boolean"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>

    </xsd:schema>
  </wsdl:types>

  <wsdl:message name="ListarProductosRequestMessage">
    <wsdl:part name="parameters" element="tns:ListarProductosRequest"/>
  </wsdl:message>
  <wsdl:message name="ListarProductosResponseMessage">
    <wsdl:part name="parameters" element="tns:ListarProductosResponse"/>
  </wsdl:message>
  <wsdl:message name="ObtenerProductoRequestMessage">
    <wsdl:part name="parameters" element="tns:ObtenerProductoRequest"/>
  </wsdl:message>
  <wsdl:message name="ObtenerProductoResponseMessage">
    <wsdl:part name="parameters" element="tns:ObtenerProductoResponse"/>
  </wsdl:message>
  <wsdl:message name="CalcularIgvRequestMessage">
    <wsdl:part name="parameters" element="tns:CalcularIgvRequest"/>
  </wsdl:message>
  <wsdl:message name="CalcularIgvResponseMessage">
    <wsdl:part name="parameters" element="tns:CalcularIgvResponse"/>
  </wsdl:message>
  <wsdl:message name="ConsultarStockRequestMessage">
    <wsdl:part name="parameters" element="tns:ConsultarStockRequest"/>
  </wsdl:message>
  <wsdl:message name="ConsultarStockResponseMessage">
    <wsdl:part name="parameters" element="tns:ConsultarStockResponse"/>
  </wsdl:message>

  <wsdl:portType name="MiniMarketPortType">
    <wsdl:operation name="ListarProductos">
      <wsdl:input message="tns:ListarProductosRequestMessage"/>
      <wsdl:output message="tns:ListarProductosResponseMessage"/>
    </wsdl:operation>
    <wsdl:operation name="ObtenerProducto">
      <wsdl:input message="tns:ObtenerProductoRequestMessage"/>
      <wsdl:output message="tns:ObtenerProductoResponseMessage"/>
    </wsdl:operation>
    <wsdl:operation name="CalcularIgv">
      <wsdl:input message="tns:CalcularIgvRequestMessage"/>
      <wsdl:output message="tns:CalcularIgvResponseMessage"/>
    </wsdl:operation>
    <wsdl:operation name="ConsultarStock">
      <wsdl:input message="tns:ConsultarStockRequestMessage"/>
      <wsdl:output message="tns:ConsultarStockResponseMessage"/>
    </wsdl:operation>
  </wsdl:portType>

  <wsdl:binding name="MiniMarketBinding" type="tns:MiniMarketPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="ListarProductos">
      <soap:operation soapAction="${TNS}/ListarProductos"/>
      <wsdl:input><soap:body use="literal"/></wsdl:input>
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ObtenerProducto">
      <soap:operation soapAction="${TNS}/ObtenerProducto"/>
      <wsdl:input><soap:body use="literal"/></wsdl:input>
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="CalcularIgv">
      <soap:operation soapAction="${TNS}/CalcularIgv"/>
      <wsdl:input><soap:body use="literal"/></wsdl:input>
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ConsultarStock">
      <soap:operation soapAction="${TNS}/ConsultarStock"/>
      <wsdl:input><soap:body use="literal"/></wsdl:input>
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
  </wsdl:binding>

  <wsdl:service name="MiniMarketService">
    <wsdl:port name="MiniMarketPort" binding="tns:MiniMarketBinding">
      <soap:address location="http://localhost:3001/soap/minimarket"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>`;
