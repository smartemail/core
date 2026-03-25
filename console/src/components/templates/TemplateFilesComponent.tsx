import { fileManagerApi, ListFileResponse } from '../../services/api/file_manager'
import { Button,  Table, Popconfirm } from 'antd'
import { filesize } from 'filesize'
import {  DeleteOutlined } from '@ant-design/icons'

type TemplateFilesComponentProps = { 
    filesData: ListFileResponse[],
    prefix: string,
    onDelete: (id: string, templateId: string) => void
};

export function TemplateFilesComponent({filesData, onDelete, prefix} : TemplateFilesComponentProps) {

    

    return (
        <Table
            className="table-no-cell-border"
            dataSource={filesData}
            rowKey="id"
            rowClassName={(_, index) => (index % 2 === 1 ? 'zebra-row' : '')}
            pagination={false}
            columns={[
                {
                    title: 'Image',
                    key: 'image',
                    render: (_, record) => (
                        <img
                            src={record.url}
                            alt={record.name}
                            style={{ height: 64, borderRadius: '8px', objectFit: 'cover' }}
                        />
                    )
                },
                {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name'
                },
                {
                    title: 'Size',
                    dataIndex: 'size',
                    key: 'size',
                    render: (size: number) => filesize(size, { round: 0, separator: ',' })
                },
                {
                    key: 'actions',
                    align: 'right' as const,
                    render: (_, record) => (
                        <Popconfirm
                            title="Delete this file?"
                            description="Are you sure you want to delete this file?"
                            onConfirm={() => onDelete(record.id, prefix)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="text" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )
                }
            ]}
        />
    )
}